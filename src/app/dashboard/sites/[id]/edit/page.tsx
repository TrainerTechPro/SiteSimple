import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import SiteEditor from "./SiteEditor";

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
    <SiteEditor
      siteId={site.id}
      siteName={site.name}
      siteSlug={site.slug}
      pages={site.pages.map((page) => ({
        id: page.id,
        title: page.title,
        sections: page.sections.map((s) => ({
          id: s.id,
          type: s.type,
          order: s.order,
          content: s.content as Record<string, unknown>,
        })),
      }))}
    />
  );
}
