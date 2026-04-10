import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateSiteForm from "@/components/admin/CreateSiteForm";

export default async function AdminNewSite({
  searchParams,
}: {
  searchParams: { owner?: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

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
            <span className="text-gray-700">New Site</span>
          </li>
        </ol>
      </nav>

      {/* Form */}
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Site</h1>
          <p className="text-gray-500 text-sm mt-1">
            Set up a new website for a client
          </p>
        </div>

        <CreateSiteForm clients={clients} defaultOwnerId={searchParams.owner} />
      </div>
    </div>
  );
}
