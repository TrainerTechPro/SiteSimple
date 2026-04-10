import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { toggleSiteStatus, deleteSite, createPage, updateSite, deletePage } from "@/lib/actions";
import ConfirmDeleteButton from "@/components/ui/ConfirmDeleteButton";

export default async function AdminSiteDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true, email: true } },
      pages: {
        orderBy: { title: "asc" },
        include: {
          _count: { select: { sections: true } },
        },
      },
    },
  });

  if (!site) {
    notFound();
  }

  const toggleStatusAction = async () => {
    "use server";
    await toggleSiteStatus(site.id);
  };

  const deleteSiteAction = async () => {
    "use server";
    await deleteSite(site.id);
  };

  const createPageAction = async (formData: FormData) => {
    "use server";
    await createPage(site.id, formData);
  };

  const updateSiteAction = async (formData: FormData) => {
    "use server";
    await updateSite(site.id, formData);
  };

  const deletePageAction = async (pageId: string) => {
    "use server";
    await deletePage(pageId);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li>
            <Link href="/admin/sites" className="hover:text-amber-600 transition-colors">
              Sites
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            <span className="text-gray-700">{site.name}</span>
          </li>
        </ol>
      </nav>

      {/* Site Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                  site.status === "LIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {site.status === "LIVE" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" aria-hidden="true" />
                )}
                {site.status}
              </span>
            </div>

            <div className="space-y-1 mt-3">
              <p className="text-sm text-gray-500">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider mr-2">
                  Slug
                </span>
                <span className="font-mono">/{site.slug}</span>
              </p>
              {site.domain && (
                <p className="text-sm text-gray-500">
                  <span className="font-mono text-xs text-gray-400 uppercase tracking-wider mr-2">
                    Domain
                  </span>
                  {site.domain}
                </p>
              )}
              <p className="text-sm text-gray-500">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider mr-2">
                  Owner
                </span>
                <Link
                  href={`/admin/clients/${site.ownerId}`}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {site.owner.name}
                </Link>{" "}
                <span className="text-gray-400">({site.owner.email})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {site.status === "LIVE" && (
              <Link
                href={`/sites/${site.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Preview
              </Link>
            )}

            <form action={toggleStatusAction}>
              <button
                type="submit"
                className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                  site.status === "LIVE"
                    ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                }`}
              >
                {site.status === "LIVE" ? "Set to Draft" : "Publish Live"}
              </button>
            </form>

            <ConfirmDeleteButton
              action={deleteSiteAction}
              message="Delete this site? All pages and sections will be permanently removed."
              label="Delete Site"
              className="btn-danger text-sm"
            />
          </div>
        </div>
      </div>

      {/* Edit Site */}
      <details className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-amber-600 transition-colors">
          Edit Site
        </summary>
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <form action={updateSiteAction} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                Site Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={site.name}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                Domain (optional)
              </label>
              <input
                type="text"
                name="domain"
                defaultValue={site.domain ?? ""}
                placeholder="example.com"
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary text-sm">
              Save Changes
            </button>
          </form>
        </div>
      </details>

      {/* Pages Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Pages ({site.pages.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Site pages">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Sections
                </th>
                <th className="text-right px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {site.pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No pages yet. Add one below.
                  </td>
                </tr>
              ) : (
                site.pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/sites/${site.id}/pages/${page.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-amber-600"
                      >
                        {page.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {page._count.sections}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/sites/${site.id}/pages/${page.id}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-mono uppercase tracking-wider"
                      >
                        Edit
                      </Link>
                      {page.slug !== "home" && (
                        <form action={deletePageAction.bind(null, page.id)}>
                          <button
                            type="submit"
                            className="text-xs text-red-500 hover:text-red-700 font-mono uppercase tracking-wider"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Page Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Add New Page</h3>
        <form action={createPageAction} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
              Page Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="About Us"
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
              Page Slug
            </label>
            <input
              type="text"
              name="slug"
              required
              placeholder="about-us"
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            Add Page
          </button>
        </form>
      </div>
    </div>
  );
}
