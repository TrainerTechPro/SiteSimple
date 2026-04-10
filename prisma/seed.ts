import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Seed cannot be run in production!");
    process.exit(1);
  }

  console.log("🌱 Seeding database...\n");

  // Clear existing data in order (respecting foreign keys)
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();
  await prisma.site.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data.");

  // Create admin user
  const adminPassword = await hash("Admin1234!", 12);
  const admin = await prisma.user.create({
    data: {
      email: "anthonylsommers@gmail.com",
      name: "Tony Sommers",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create demo client
  const clientPassword = await hash("Client1234!", 12);
  const client = await prisma.user.create({
    data: {
      email: "demo@client.com",
      name: "Demo Barbershop",
      password: clientPassword,
      role: "CLIENT",
    },
  });
  console.log(`Created client user: ${client.email}`);

  // Create demo site
  const site = await prisma.site.create({
    data: {
      name: "The Classic Cut",
      slug: "the-classic-cut",
      status: "LIVE",
      ownerId: client.id,
    },
  });
  console.log(`Created site: ${site.name} (/${site.slug})`);

  // Create home page
  const page = await prisma.page.create({
    data: {
      title: "Home",
      slug: "home",
      siteId: site.id,
    },
  });
  console.log(`Created page: ${page.title}`);

  // Create sections
  const sections = await Promise.all([
    prisma.section.create({
      data: {
        type: "HERO",
        order: 0,
        pageId: page.id,
        content: {
          headline: "The Classic Cut",
          subheadline: "Premium grooming for the modern gentleman",
          ctaText: "Book Now",
          ctaLink: "#contact",
          backgroundImage: "",
        },
      },
    }),
    prisma.section.create({
      data: {
        type: "TEXT",
        order: 1,
        pageId: page.id,
        content: {
          title: "Our Story",
          body: "Founded in 2020, The Classic Cut has been serving the community with premium haircuts and grooming services. Our experienced barbers combine traditional techniques with modern styles to give you the perfect look.",
        },
      },
    }),
    prisma.section.create({
      data: {
        type: "PRICING",
        order: 2,
        pageId: page.id,
        content: {
          title: "Services & Pricing",
          items: [
            {
              name: "Classic Haircut",
              price: "$30",
              description: "Precision cut with hot towel finish",
            },
            {
              name: "Beard Trim",
              price: "$20",
              description: "Shape and trim with beard oil",
            },
            {
              name: "Deluxe Package",
              price: "$45",
              description: "Haircut + beard trim + hot towel",
            },
            {
              name: "Kids Cut",
              price: "$20",
              description: "Ages 12 and under",
            },
          ],
        },
      },
    }),
    prisma.section.create({
      data: {
        type: "CTA",
        order: 3,
        pageId: page.id,
        content: {
          headline: "Ready for a fresh look?",
          buttonText: "Book Your Appointment",
          buttonLink: "#contact",
        },
      },
    }),
    prisma.section.create({
      data: {
        type: "CONTACT",
        order: 4,
        pageId: page.id,
        content: {
          phone: "(555) 234-5678",
          email: "hello@theclassiccut.com",
          address: "456 Oak Avenue\nBrooklyn, NY 11201",
          showMap: true,
        },
      },
    }),
  ]);

  console.log(`Created ${sections.length} sections on Home page.`);

  console.log("\n✅ Seed complete!");
  console.log("   Admin login:  anthonylsommers@gmail.com / Admin1234!");
  console.log("   Client login: demo@client.com / Client1234!");
  console.log(`   Public site:  /sites/${site.slug}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
