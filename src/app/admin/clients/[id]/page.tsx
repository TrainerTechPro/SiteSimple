import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateClient, resetClientPassword } from "@/lib/actions";

export default async function AdminClientDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const client = await prisma.user.findUnique({
    where: { id: params.id, role: "CLIENT" },
    include: {
      sites: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const updateClientAction = async (formData: FormData) => {
    "use server";
    await updateClient(client.id, formData);
  };

  const resetPasswordAction = async (formData: FormData) => {
    "use server";
    await resetClientPassword(client.id, formData);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li>
            <Link href="/admin/clients" className="hover:text-amber-600 transition-colors">
              Clients
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            <span className="text-gray-700">{client.name}</span>
          </li>
        </ol>
      </nav>

      {/* Client Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{client.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-700">
                CLIENT
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Joined{" "}
                {new Date(client.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <Link
            href={`/admin/sites/new?owner=${client.id}`}
            className="btn-primary text-sm"
          >
            + New Site
          </Link>
        </div>
      </div>

      {/* Edit Client */}
      <details className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-amber-600 transition-colors">
          Edit Client
        </summary>
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <form action={updateClientAction} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={client.name ?? ""}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={client.email ?? ""}
                required
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary text-sm">
              Save Changes
            </button>
          </form>
        </div>
      </details>

      {/* Reset Password */}
      <details className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-amber-600 transition-colors">
          Reset Password
        </summary>
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <form action={resetPasswordAction} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary text-sm">
              Reset Password
            </button>
          </form>
        </div>
      </details>

      {/* Client Sites */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            Sites ({client.sites.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Client sites">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Pages
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {client.sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No sites yet.{" "}
                    <Link
                      href={`/admin/sites/new?owner=${client.id}`}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                client.sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/sites/${site.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-amber-600"
                      >
                        {site.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      /{site.slug}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {site._count.pages}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(site.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
