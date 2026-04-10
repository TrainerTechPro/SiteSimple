import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function SiteOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      pages: {
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!site) {
    notFound();
  }

  if (site.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-sm text-amber-600 hover:text-amber-700 font-medium mb-6 inline-block"
      >
        &larr; Back to My Sites
      </Link>

      {/* Site header */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {site.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>Slug: /{site.slug}</span>
              {site.domain && <span>Domain: {site.domain}</span>}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  site.status === "LIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {site.status === "LIVE" ? "Live" : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/sites/${site.id}/edit`}
              className="btn-primary text-sm"
            >
              Edit Content
            </Link>
            {site.status === "LIVE" && (
              <Link
                href={`/sites/${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm !text-gray-600 !border-gray-300 hover:!bg-gray-100"
              >
                View Live Site ↗
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pages list */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Pages</h2>

      {site.pages.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No pages have been added to this site yet. Contact your admin to add
            pages.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {site.pages.map((page) => (
            <div key={page.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-sm text-gray-500">
                    /{page.slug} &middot; {page.sections.length} section
                    {page.sections.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/sites/${site.id}/edit`}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  Edit &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
