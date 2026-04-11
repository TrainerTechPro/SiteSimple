import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const sites = await prisma.site.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      templatePath: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Sites</h1>
      <p className="text-gray-500 mb-8">
        Manage your website content with just a few clicks.
      </p>

      {sites.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌐</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No sites yet
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Your website will appear here once your admin sets it up for you.
            Contact your account manager to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="card flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {site.name}
                </h2>
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

              <p className="text-sm text-gray-500 mb-4">
                /{site.slug}
              </p>

              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href={site.templatePath ? `/dashboard/sites/${site.id}/template` : `/dashboard/sites/${site.id}/edit`}
                  className="btn-primary text-center text-sm"
                >
                  Edit Content
                </Link>

                {site.status === "LIVE" && (
                  <Link
                    href={`/sites/${site.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-center text-sm !text-gray-600 !border-gray-300 hover:!bg-gray-100"
                  >
                    View Site ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
