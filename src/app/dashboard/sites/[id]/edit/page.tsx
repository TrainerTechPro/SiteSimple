import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ClientEditor from "./ClientEditor";

export default async function EditSitePage({
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
      <Link
        href="/dashboard"
        className="text-sm text-amber-600 hover:text-amber-700 font-medium mb-6 inline-block"
      >
        &larr; Back to My Sites
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Edit: {site.name}
        </h1>
        <p className="text-gray-500">
          Update your website content below. Changes are saved per section.
        </p>
      </div>

      {site.pages.map((page) => (
        <div key={page.id} className="mb-10">
          {site.pages.length > 1 && (
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {page.title}
            </h2>
          )}

          {page.sections.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">
                No sections on this page yet. Contact your admin to add content
                sections.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {page.sections.map((section) => (
                <ClientEditor
                  key={section.id}
                  sectionId={section.id}
                  sectionType={section.type}
                  initialContent={section.content as Record<string, unknown>}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
