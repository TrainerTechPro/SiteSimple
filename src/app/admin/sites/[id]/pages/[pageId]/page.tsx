import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PageEditor from "./PageEditor";

export default async function AdminPageEditor({
  params,
}: {
  params: { id: string; pageId: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    include: {
      site: { select: { name: true, slug: true } },
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page || page.siteId !== params.id) {
    notFound();
  }

  const serializedSections = page.sections.map((section) => ({
    id: section.id,
    type: section.type,
    order: section.order,
    content: section.content as Record<string, unknown>,
    pageId: section.pageId,
  }));

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
          <li>
            <Link
              href={`/admin/sites/${params.id}`}
              className="hover:text-amber-600 transition-colors"
            >
              {page.site.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            <span className="text-gray-700">{page.title}</span>
          </li>
        </ol>
      </nav>

      <PageEditor
        pageId={params.pageId}
        siteId={params.id}
        pageTitle={page.title}
        siteSlug={page.site.slug}
        initialSections={serializedSections}
      />
    </div>
  );
}
