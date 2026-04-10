import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteClient } from "@/lib/actions";
import CreateClientForm from "@/components/admin/CreateClientForm";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

export default async function AdminClients({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const total = await prisma.user.count({ where: { role: "CLIENT" } });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      _count: { select: { sites: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your client accounts
          </p>
        </div>
      </div>

      {/* New Client Form */}
      <details className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 group">
        <summary className="px-6 py-4 cursor-pointer flex items-center justify-between list-none">
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Client
          </span>
          <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <CreateClientForm />
        </div>
      </details>

      {/* Clients Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="All clients">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Sites
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="text-right px-6 py-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No clients yet. Create your first client above.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-amber-600"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-gray-100 text-gray-600">
                        {client._count.sites}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="text-xs text-gray-500 hover:text-amber-600 font-mono uppercase tracking-wider"
                        >
                          View
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteClient(client.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-gray-400 hover:text-red-600 font-mono uppercase tracking-wider"
                            onClick={(e) => {
                              if (!confirm("Delete this client? This cannot be undone.")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} baseUrl="/admin/clients" />
    </div>
  );
}
