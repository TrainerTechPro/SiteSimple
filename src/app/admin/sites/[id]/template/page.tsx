import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TemplateEditor from "@/components/admin/TemplateEditor";

export default async function AdminTemplateEditorPage({
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
  });

  if (!site) {
    notFound();
  }

  if (!site.templatePath || !site.templateData) {
    // Not a template site — redirect back to site detail
    redirect(`/admin/sites/${site.id}`);
  }

  return (
    <TemplateEditor
      siteId={site.id}
      siteName={site.name}
      siteSlug={site.slug}
      initialData={site.templateData as Record<string, string>}
      previewUrl={`/api/render/${site.slug}`}
      backUrl={`/admin/sites/${site.id}`}
    />
  );
}
