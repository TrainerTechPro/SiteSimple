"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma, SectionType, SiteStatus } from "@prisma/client";
import { sectionSchemas } from "./validations";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Client Management ───

export async function createClient(prevState: { error: string } | null, formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email || !name || !password) {
    return { error: "All fields are required" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already exists" };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "CLIENT",
    },
  });

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function updateClient(clientId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: clientId } },
  });
  if (existing) {
    return { error: "Email already in use" };
  }

  await prisma.user.update({
    where: { id: clientId },
    data: { name, email },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

export async function resetClientPassword(clientId: string, formData: FormData) {
  await requireAdmin();

  const password = formData.get("password") as string;
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const hashedPassword = await hash(password, 12);
  await prisma.user.update({
    where: { id: clientId },
    data: { password: hashedPassword },
  });

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id: clientId } });
  revalidatePath("/admin/clients");
}

// ─── Site Management ───

export async function createSite(prevState: { error: string } | null, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const ownerId = formData.get("ownerId") as string;
  const domain = (formData.get("domain") as string) || null;

  if (!name || !slug || !ownerId) {
    return { error: "Name, slug, and owner are required" };
  }

  const existingSlug = await prisma.site.findUnique({ where: { slug } });
  if (existingSlug) {
    return { error: "Slug already exists" };
  }

  const site = await prisma.site.create({
    data: {
      name,
      slug,
      domain,
      ownerId,
      pages: {
        create: {
          title: "Home",
          slug: "home",
        },
      },
    },
  });

  revalidatePath("/admin/sites");
  redirect(`/admin/sites/${site.id}`);
}

export async function toggleSiteStatus(siteId: string) {
  await requireAdmin();

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return;

  await prisma.site.update({
    where: { id: siteId },
    data: {
      status: site.status === "LIVE" ? "DRAFT" : "LIVE",
    },
  });

  revalidatePath(`/admin/sites/${siteId}`);
}

export async function updateSite(siteId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const domain = (formData.get("domain") as string) || null;

  if (!name) {
    return { error: "Site name is required" };
  }

  await prisma.site.update({
    where: { id: siteId },
    data: { name, domain },
  });

  revalidatePath(`/admin/sites/${siteId}`);
}

export async function deleteSite(siteId: string) {
  await requireAdmin();
  await prisma.site.delete({ where: { id: siteId } });
  revalidatePath("/admin/sites");
  redirect("/admin/sites");
}

// ─── Template Site Management ───

export async function updateTemplateData(
  siteId: string,
  templateData: Record<string, string>
) {
  const session = await requireAuth();

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { ownerId: true, slug: true, templateData: true },
  });

  if (!site) {
    throw new Error("Site not found");
  }

  // Clients can only edit their own sites
  if (
    session.user.role === "CLIENT" &&
    site.ownerId !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  // Merge with existing data so partial updates are safe
  const existingData = (site.templateData as Record<string, string> | null) || {};
  const mergedData = { ...existingData, ...templateData };

  await prisma.site.update({
    where: { id: siteId },
    data: {
      templateData: mergedData as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/admin/sites/${siteId}/template`);
  revalidatePath(`/dashboard/sites/${siteId}/template`);
  revalidatePath(`/sites/${site.slug}`);
  revalidatePath(`/api/render/${site.slug}`);
}

// ─── Page Management ───

export async function createPage(siteId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;

  if (!title || !slug) {
    return { error: "Title and slug are required" };
  }

  await prisma.page.create({
    data: { title, slug, siteId },
  });

  revalidatePath(`/admin/sites/${siteId}`);
}

export async function deletePage(pageId: string) {
  await requireAdmin();

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { siteId: true, slug: true },
  });

  if (!page) return;

  // Don't allow deleting the home page
  if (page.slug === "home") {
    return { error: "Cannot delete the home page" };
  }

  await prisma.page.delete({ where: { id: pageId } });
  revalidatePath(`/admin/sites/${page.siteId}`);
}

// ─── Section Management ───

export async function addSection(pageId: string, type: SectionType) {
  await requireAdmin();

  const validTypes = ["HERO", "TEXT", "PRICING", "CTA", "CONTACT", "GALLERY"];
  if (!validTypes.includes(type)) {
    throw new Error("Invalid section type");
  }

  const maxOrder = await prisma.section.findFirst({
    where: { pageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const defaultContent = getDefaultContent(type);

  await prisma.section.create({
    data: {
      type,
      order: (maxOrder?.order ?? -1) + 1,
      content: defaultContent as unknown as Prisma.InputJsonValue,
      pageId,
    },
  });

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { siteId: true },
  });

  if (page) {
    revalidatePath(`/admin/sites/${page.siteId}/pages/${pageId}`);
  }
}

export async function updateSection(
  sectionId: string,
  content: Record<string, unknown>
) {
  const session = await requireAuth();

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { page: { include: { site: true } } },
  });

  if (!section) return;

  // Clients can only edit their own sites
  if (
    session.user.role === "CLIENT" &&
    section.page.site.ownerId !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  // Validate content against the section's schema
  const schema = sectionSchemas[section.type as keyof typeof sectionSchemas];
  if (!schema) {
    throw new Error("Invalid section content");
  }
  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    throw new Error("Invalid section content");
  }

  await prisma.section.update({
    where: { id: sectionId },
    data: { content: parsed.data as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/admin/sites/${section.page.siteId}/pages/${section.pageId}`);
  revalidatePath(`/dashboard/sites/${section.page.siteId}/edit`);
  revalidatePath(`/sites/${section.page.site.slug}`);
}

export async function deleteSection(sectionId: string) {
  await requireAdmin();

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { page: true },
  });

  if (!section) return;

  await prisma.section.delete({ where: { id: sectionId } });

  revalidatePath(
    `/admin/sites/${section.page.siteId}/pages/${section.pageId}`
  );
}

export async function reorderSections(
  pageId: string,
  sectionIds: string[]
) {
  await requireAdmin();

  // Validate all section IDs belong to the specified page
  const sections = await prisma.section.findMany({
    where: { pageId, id: { in: sectionIds } },
    select: { id: true },
  });
  if (sections.length !== sectionIds.length) {
    throw new Error("Invalid section IDs");
  }

  await prisma.$transaction(
    sectionIds.map((id, index) =>
      prisma.section.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { siteId: true },
  });

  if (page) {
    revalidatePath(`/admin/sites/${page.siteId}/pages/${pageId}`);
  }
}

// ─── Helpers ───

function getDefaultContent(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "HERO":
      return {
        headline: "Welcome to Our Business",
        subheadline: "We provide the best services for you",
        ctaText: "Get Started",
        ctaLink: "#contact",
        backgroundImage: "",
      };
    case "TEXT":
      return {
        title: "About Us",
        body: "Tell your story here...",
      };
    case "PRICING":
      return {
        title: "Our Pricing",
        items: [
          { name: "Basic", price: "$29", description: "Perfect for starters" },
          { name: "Pro", price: "$59", description: "For growing businesses" },
        ],
      };
    case "CTA":
      return {
        headline: "Ready to get started?",
        buttonText: "Contact Us",
        buttonLink: "#contact",
      };
    case "CONTACT":
      return {
        phone: "(555) 123-4567",
        email: "hello@example.com",
        address: "123 Main Street\nAnytown, USA",
        showMap: true,
      };
    case "GALLERY":
      return { images: [] };
  }
}
