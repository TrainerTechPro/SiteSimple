import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

export default async function AdminSites({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const total = await prisma.site.count();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { pages: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all client websites
          </p>
        </div>
        <Link href="/admin/sites/new" className="btn-primary">
          + New Site
        </Link>
      </div>

      {/* Sites Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="All sites">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Owner
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
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No sites yet.{" "}
                    <Link
                      href="/admin/sites/new"
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Create your first site
                    </Link>
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/sites/${site.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-amber-600"
                      >
                        {site.name}
                      </Link>
                      {site.domain && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {site.domain}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{site.owner.name}</p>
                      <p className="text-xs text-gray-400">{site.owner.email}</p>
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

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/admin/sites" />
    </div>
  );
}
