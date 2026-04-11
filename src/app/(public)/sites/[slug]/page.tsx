import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await prisma.site.findUnique({
    where: { slug: params.slug },
    select: { name: true, templateData: true },
  });

  if (!site) {
    return { title: "Site Not Found" };
  }

  const td = (site.templateData as Record<string, string> | null) || {};
  const title = td.SITE_TITLE || site.name;
  const description = td.SITE_DESCRIPTION || `Welcome to ${site.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/sites/${params.slug}`,
    },
    twitter: {
      card: "summary",
      title,
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = params;

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      pages: {
        include: {
          sections: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { slug: "asc" },
      },
    },
  });

  if (!site || site.status === "DRAFT") {
    notFound();
  }

  // Template-based sites: redirect to the dedicated render route
  if (site.templatePath && site.templateData) {
    redirect(`/api/render/${slug}`);
  }

  // Legacy imported static sites: redirect to the imported HTML
  if (site.importedPath) {
    redirect(site.importedPath);
  }

  const { pages } = site;

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-amber-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium">
        Skip to main content
      </a>
      {/* Header */}
      <header
        className="w-full py-4 px-6 flex items-center justify-between"
        style={{ backgroundColor: "#111111" }}
      >
        <h1 className="text-white text-xl font-bold">{site.name}</h1>
        <span className="text-gray-500 text-xs tracking-wide">
          Powered by SiteSimple
        </span>
      </header>

      {/* Page Navigation */}
      {pages.length > 1 && (
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex gap-6">
            {pages.map((page) => (
              <a key={page.id} href={`#${page.slug}`} className="text-sm text-gray-600 hover:text-amber-500">
                {page.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Sections */}
      <main id="main-content" className="flex-1">
        {pages.map((page) => (
          <div key={page.id} id={page.slug}>
            {page.sections.map((section) => (
              <SectionRenderer
                key={section.id}
                type={section.type}
                content={section.content as Record<string, unknown>}
              />
            ))}
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-700 font-medium">{site.name}</p>
          <p className="text-gray-400 text-sm mt-1">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-gray-300 text-xs mt-3">
            Built with SiteSimple
          </p>
        </div>
      </footer>
    </div>
  );
}
