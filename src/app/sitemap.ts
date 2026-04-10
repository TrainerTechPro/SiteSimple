import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await prisma.site.findMany({
    where: { status: "LIVE" },
    select: { slug: true, updatedAt: true },
  });

  return sites.map((site) => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/sites/${site.slug}`,
    lastModified: site.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
