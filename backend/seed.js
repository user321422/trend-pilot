// backend/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data to prevent constraint errors
  await prisma.assignment.deleteMany({});
  await prisma.brief.deleteMany({});
  await prisma.trend.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── 1. Admin & Editor ────────────────────────────────────────────────────
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
      },
    ],
  });

  // ── 2. Writers — with completedCount + avgReviewScore for Agent 3 ────────
  await prisma.user.createMany({
    data: [
      {
        name: 'Alice Techwriter',
        email: 'alice@trendpilot.com',
        passwordHash,
        currentLoad: 1,
        completedCount: 12,
        avgReviewScore: 88.5,
      },
      {
        name: 'Bob Marketer',
        email: 'bob@trendpilot.com',
        passwordHash,
        currentLoad: 0,
        completedCount: 5,
        avgReviewScore: 71.0,
      },
      {
        name: 'Charlie Overloaded',
        email: 'charlie@trendpilot.com',
        passwordHash,
        currentLoad: 3,
        completedCount: 20,
        avgReviewScore: 82.0,
      },
      {
        name: 'Diana Generalist',
        email: 'diana@trendpilot.com',
        passwordHash,
        currentLoad: 0,
        completedCount: 8,
        avgReviewScore: 79.5,
      },
      {
        name: 'Evan Junior',
        email: 'evan@trendpilot.com',
        passwordHash,
        currentLoad: 0,
        completedCount: 2,
        avgReviewScore: 65.0,
      },
    ],
  });

  // ── 3. Sample trend + approved brief for Agent 3 testing ─────────────────
  const trend = await prisma.trend.create({
    data: {
      title: 'AI Tools Dominating Content Marketing in 2025',
      source: 'manual',
      trendScore: 85,
      relevanceScore: 90,
      opportunityScore: 88,
    },
  });

  await prisma.brief.create({
    data: {
      trendId: trend.id,
      h1: 'Top 10 AI Tools for Content Teams in 2025',
      angle: 'Practical productivity angle for marketing managers',
      seoKeywords: ['AI tools', 'content marketing', 'productivity', 'automation'],
      status: 'APPROVED',
    },
  });

  console.log('✅ Database seeded:');
  console.log('   • 2 staff accounts (admin + editor)');
  console.log('   • 5 writers with performance data (completedCount + avgReviewScore)');
  console.log('   • 1 trend created');
  console.log('   • 1 approved brief linked to trend — ready for Agent 3 testing');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });