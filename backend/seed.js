import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing writers and assignments to prevent constraint errors
  await prisma.assignment.deleteMany({});
  await prisma.user.deleteMany({});

  // Create a default password hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Admin & Editor
  await prisma.user.createMany({
    data: [
      {
        name: 'Super Admin',
        email: 'admin@trendpilot.com',
        passwordHash,
      },
      {
        name: 'Lead Editor',
        email: 'editor@trendpilot.com',
        passwordHash,
      }
    ]
  });

  // 2. Writers (Diverse for Agent 3 to rank)
  await prisma.user.createMany({
    data: [
      {
        name: 'Alice Techwriter',
        email: 'alice@trendpilot.com',
        passwordHash,
        expertiseTags: ['Technology', 'AI', 'SaaS', 'Programming'],
        historicalRating: 4.8,
        currentLoad: 1,
        maxLoad: 3
      },
      {
        name: 'Bob Marketer',
        email: 'bob@trendpilot.com',
        passwordHash,
        expertiseTags: ['Marketing', 'SEO', 'Social Media', 'Growth'],
        historicalRating: 4.2,
        currentLoad: 0,
        maxLoad: 4
      },
      {
        name: 'Charlie Overloaded',
        email: 'charlie@trendpilot.com',
        passwordHash,
        expertiseTags: ['Finance', 'Crypto', 'Economics'],
        historicalRating: 4.9,
        currentLoad: 3, // At max load!
        maxLoad: 3
      },
      {
        name: 'Diana Generalist',
        email: 'diana@trendpilot.com',
        passwordHash,
        expertiseTags: ['Lifestyle', 'Health', 'Productivity'],
        historicalRating: 3.8,
        currentLoad: 0,
        maxLoad: 5
      },
      {
        name: 'Evan Junior',
        email: 'evan@trendpilot.com',
        passwordHash,
        expertiseTags: ['Technology', 'Gaming'],
        historicalRating: 3.5, // Lower rating
        currentLoad: 0,
        maxLoad: 2
      }
    ]
  });

  console.log("✅ Database successfully seeded with Admins, Editors, and diverse Writers for Agent 3 testing!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });