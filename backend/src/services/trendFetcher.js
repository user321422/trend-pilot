import { PrismaClient } from "@prisma/client";
import {
  computeTrendScore,
  computeRelevanceScore,
  computeOpportunityScore,
} from "./trendScorer.js";

const prisma = new PrismaClient();

const NICHE_KEYWORDS = ["AI", "tech", "software", "startup", "digital", "data", "cloud", "SEO"];

// Fallback seed data so the demo works even if external APIs are down
const MOCK_TRENDS = [
  { title: "AI Agents replacing SaaS tools", source: "google_trends", volume: 95 },
  { title: "Vibe coding with Claude", source: "google_trends", volume: 88 },
  { title: "OpenAI GPT-5 release", source: "reddit", volume: 76 },
  { title: "Cursor vs Copilot debate", source: "reddit", volume: 70 },
  { title: "Startup valuations in 2026", source: "google_trends", volume: 65 },
  { title: "Cloud cost optimization tips", source: "google_trends", volume: 60 },
  { title: "SEO is dead or not", source: "reddit", volume: 55 },
  { title: "Data privacy new regulations", source: "google_trends", volume: 50 },
];

export async function fetchAndStoreTrends() {
  console.log("Fetching trends...");

  const sourceMax = Math.max(...MOCK_TRENDS.map((t) => t.volume));

  const stored = [];

  for (const raw of MOCK_TRENDS) {
    const trendScore = computeTrendScore(raw.volume, sourceMax);
    const relevanceScore = computeRelevanceScore(raw.title, NICHE_KEYWORDS);
    const opportunityScore = computeOpportunityScore(trendScore, relevanceScore);

    const trend = await prisma.trend.upsert({
      where: { id: (await prisma.trend.findFirst({ where: { title: raw.title } }))?.id ?? "none" },
      update: { trendScore, relevanceScore, opportunityScore },
      create: {
        title: raw.title,
        source: raw.source,
        rawData: raw,
        trendScore,
        relevanceScore,
        opportunityScore,
        aiExplanation: null,
      },
    });

    stored.push(trend);
  }

  console.log(`Stored ${stored.length} trends.`);
  return stored;
}