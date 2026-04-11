import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TemplateEditor from "@/components/admin/TemplateEditor";

export default async function ClientTemplateEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const site = await prisma.site.findUnique({
    where: { id: params.id },
  });

  if (!site) {
    notFound();
  }

  // Verify ownership (clients can only edit their own sites)
  if (session.user.role === "CLIENT" && site.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  if (!site.templatePath || !site.templateData) {
    // Not a template site — redirect to regular editor
    redirect(`/dashboard/sites/${site.id}/edit`);
  }

  return (
    <TemplateEditor
      siteId={site.id}
      siteName={site.name}
      siteSlug={site.slug}
      initialData={site.templateData as Record<string, string>}
      previewUrl={`/api/render/${site.slug}`}
      backUrl="/dashboard"
    />
  );
}
