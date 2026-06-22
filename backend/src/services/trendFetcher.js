import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "./qwen.js";

const prisma = new PrismaClient();

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

async function analyzeTrendWithAgent1(trendTitle, source, userApiKey) {
  const prompt = `You are Agent 1, the Trend Scorer for a B2B Tech / SaaS content publication.
Analyze the following trending topic:
Title: "${trendTitle}"
Source: "${source}"

Evaluate this topic and return a JSON object with strictly the following keys:
- "relevanceScore": Number 0-100 (How relevant is this to our tech/SaaS audience?)
- "opportunityScore": Number 0-100 (Is this a saturated topic or a fresh, high-value opportunity?)
- "aiExplanation": String (A 2-3 sentence explanation of why this trend matters and the angle we should take.)`;

  try {
    const result = await callQwenJSON(prompt, userApiKey);
    return {
      relevanceScore: result.relevanceScore ?? 50,
      opportunityScore: result.opportunityScore ?? 50,
      aiExplanation: result.aiExplanation ?? "No explanation generated.",
    };
  } catch (error) {
    console.error(`Agent 1 failed for ${trendTitle}:`, error.message);
    return {
      relevanceScore: 50,
      opportunityScore: 50,
      aiExplanation: "Agent 1 analysis failed. Default scores applied.",
    };
  }
}

export async function fetchAndStoreTrends(userApiKey) {
  console.log("Fetching trends...");

  const sourceMax = Math.max(...MOCK_TRENDS.map((t) => t.volume));

  const stored = [];

  for (const raw of MOCK_TRENDS) {
    // 1. Calculate basic trend volume score
    const trendScore = Math.min((raw.volume / sourceMax) * 100, 100);

    // 2. Delegate deep semantic analysis to Agent 1
    const aiAnalysis = await analyzeTrendWithAgent1(raw.title, raw.source, userApiKey);

    const trend = await prisma.trend.upsert({
      where: { id: (await prisma.trend.findFirst({ where: { title: raw.title } }))?.id ?? "none" },
      update: {
        trendScore,
        relevanceScore: aiAnalysis.relevanceScore,
        opportunityScore: aiAnalysis.opportunityScore,
        aiExplanation: aiAnalysis.aiExplanation
      },
      create: {
        title: raw.title,
        source: raw.source,
        rawData: raw,
        trendScore,
        relevanceScore: aiAnalysis.relevanceScore,
        opportunityScore: aiAnalysis.opportunityScore,
        aiExplanation: aiAnalysis.aiExplanation,
      },
    });

    stored.push(trend);
  }

  console.log(`Stored ${stored.length} trends.`);
  return stored;
}