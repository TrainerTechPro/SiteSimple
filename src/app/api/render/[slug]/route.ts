import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/template-renderer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const site = await prisma.site.findUnique({
    where: { slug: params.slug },
    select: {
      status: true,
      templatePath: true,
      templateData: true,
    },
  });

  if (!site || site.status === "DRAFT" || !site.templatePath || !site.templateData) {
    return new NextResponse("Site not found", { status: 404 });
  }

  try {
    const html = await renderTemplate(
      site.templatePath,
      site.templateData as Record<string, string>,
      params.slug
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Template render error:", error);
    return new NextResponse("Template render error", { status: 500 });
  }
}
