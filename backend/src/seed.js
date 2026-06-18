import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const users = [
    { name: "Admin User", email: "admin@trendpilot.dev", role: "ADMIN", password: "adminpass123" },
    { name: "Editor User", email: "editor@trendpilot.dev", role: "EDITOR", password: "editorpass123" },
    { name: "Writer One", email: "writer@trendpilot.dev", role: "WRITER", password: "writerpass123", expertiseTags: ["SEO", "Tech", "AI"], historicalRating: 4.2 },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        expertiseTags: u.expertiseTags ?? [],
        historicalRating: u.historicalRating ?? 3.0,
      },
    });
    console.log("  OK  " + u.role + " - " + u.email + " / " + u.password);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());