// backend/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data to prevent constraint errors
  await prisma.review.deleteMany({});
  await prisma.draft.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.brief.deleteMany({});
  await prisma.trend.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── 1. Admin Login (The only login account) ──────────────────────────────
  const exists = await prisma.user.findUnique({ where: { email: 'admin@trendpilot.com' } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@trendpilot.com',
        passwordHash,
      }
    });
  }

  // ── 2. AI Writer Agents (No login/mail, pure AI) ─────────────────────────
  for (const w of [
    {
      name: 'Tech Specialist (AI)',
      email: 'tech-ai@trendpilot.internal',
      passwordHash: 'AI_AGENT_NO_PASSWORD',
      currentLoad: 1,
      completedCount: 12,
      avgReviewScore: 88.5,
    },
    {
      name: 'Marketing Specialist (AI)',
      email: 'marketing-ai@trendpilot.internal',
      passwordHash: 'AI_AGENT_NO_PASSWORD',
      currentLoad: 0,
      completedCount: 5,
      avgReviewScore: 71.0,
    },
    {
      name: 'Creative Specialist (AI)',
      email: 'creative-ai@trendpilot.internal',
      passwordHash: 'AI_AGENT_NO_PASSWORD',
      currentLoad: 3,
      completedCount: 20,
      avgReviewScore: 82.0,
    },
    {
      name: 'Generalist Specialist (AI)',
      email: 'generalist-ai@trendpilot.internal',
      passwordHash: 'AI_AGENT_NO_PASSWORD',
      currentLoad: 0,
      completedCount: 8,
      avgReviewScore: 79.5,
    },
    {
      name: 'Junior Copywriter (AI)',
      email: 'junior-ai@trendpilot.internal',
      passwordHash: 'AI_AGENT_NO_PASSWORD',
      currentLoad: 0,
      completedCount: 2,
      avgReviewScore: 65.0,
    },
  ]) {
    const exists = await prisma.user.findUnique({ where: { email: w.email } });
    if (!exists) {
      await prisma.user.create({ data: w });
    }
  }

  // ── 3. Sample trend + approved brief for Agent 3 testing ─────────────────
  let trend = await prisma.trend.findFirst({
    where: { title: 'AI Tools Dominating Content Marketing in 2025' }
  });
  if (!trend) {
    trend = await prisma.trend.create({
      data: {
        title: 'AI Tools Dominating Content Marketing in 2025',
        source: 'manual',
        trendScore: 85,
        relevanceScore: 90,
        opportunityScore: 88,
      },
    });
  }

  const briefExists = await prisma.brief.findFirst({
    where: { h1: 'Top 10 AI Tools for Content Teams in 2025' }
  });
  if (!briefExists) {
    await prisma.brief.create({
      data: {
        trendId: trend.id,
        h1: 'Top 10 AI Tools for Content Teams in 2025',
        angle: 'Practical productivity angle for marketing managers',
        seoKeywords: ['AI tools', 'content marketing', 'productivity', 'automation'],
        status: 'APPROVED',
      },
    });
  }

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