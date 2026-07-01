import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "../services/qwen.js";

const prisma = new PrismaClient();

function buildBriefPrompt(trend) {
  return `You are an elite, senior Content Strategist and Editor for a major digital publication.
Your job is to take a raw trending topic and turn it into a highly actionable, comprehensive editorial brief for a writer.

Follow these strict guidelines for your analysis:
1. "summary": Provide a clear, 2-3 sentence overview of what the article will cover and why it matters right now.
2. "audienceAnalysis": Identify the exact target persona, their pain points, and what they hope to gain from reading this piece.
3. "angle": Propose a unique, contrarian, or highly specific hook that differentiates this article from generic content on the web.
4. "seoKeywords": Provide 5-8 highly relevant long-tail SEO keywords.
5. "h1": Write a compelling, click-worthy, SEO-optimized headline.
6. "headingStructure": Outline the article using H2s and H3s. Ensure a logical, deep-dive flow.
7. "recommendedWordCount": Provide an integer (e.g., 1200) based on the depth required for the topic.
8. "publishingGuidance": Suggest the best platforms to distribute this (e.g., LinkedIn, Twitter, Newsletter), format tips, and media requirements (e.g., "needs custom infographics").

Return ONLY valid JSON matching this exact structure, with no markdown formatting (like \`\`\`json), no commentary, and no extra text:
{
  "summary": "string",
  "audienceAnalysis": "string",
  "angle": "string",
  "seoKeywords": ["string"],
  "h1": "string",
  "headingStructure": [{ "h2": "string", "h3": ["string"] }],
  "recommendedWordCount": number,
  "publishingGuidance": "string"
}

Topic: ${trend.title}
Trend Context: ${trend.aiExplanation ?? "No additional context available."}`;
}

export async function generateBrief(req, res) {
  const { trendId } = req.body;
  const userApiKey = req.headers['x-api-key'];

  if (!trendId) {
    return res.status(400).json({ error: "trendId is required" });
  }

  const trend = await prisma.trend.findUnique({ where: { id: trendId } });
  if (!trend) {
    return res.status(404).json({ error: "Trend not found" });
  }

  const prompt = buildBriefPrompt(trend);

  try {
    const briefData = await callQwenJSON(prompt, userApiKey);

    const brief = await prisma.brief.create({
      data: {
        trendId: trend.id,
        summary: briefData.summary,
        audienceAnalysis: briefData.audienceAnalysis,
        angle: briefData.angle,
        seoKeywords: briefData.seoKeywords ?? [],
        h1: briefData.h1,
        headingStructure: briefData.headingStructure,
        wordCount: briefData.recommendedWordCount,
        publishingGuidance: briefData.publishingGuidance,
        status: "PENDING",
      },
    });

    return res.status(201).json({ brief });
  } catch (error) {
    console.error("Error generating brief:", error);
    return res.status(500).json({ error: "Failed to generate brief. AI service may have returned invalid data." });
  }
}

export async function approveBrief(req, res) {
  const { id, status, summary, angle, h1, seoKeywords } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: "id and status are required" });
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "status must be APPROVED or REJECTED" });
  }

  const brief = await prisma.brief.update({
    where: { id },
    data: {
      status,
      ...(summary && { summary }),
      ...(angle && { angle }),
      ...(h1 && { h1 }),
      ...(seoKeywords && { seoKeywords }),
    },
  });

  return res.json({ brief });
}

export async function getBriefs(req, res) {
  const briefs = await prisma.brief.findMany({
    include: {
      trend: {
        select: { title: true, opportunityScore: true, source: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return res.json({ count: briefs.length, briefs });
}

export async function autoGenerateBriefs(req, res) {
  const userApiKey = req.headers['x-api-key'];

  // Find top 3 trends by opportunity score that do not have a brief yet
  const trends = await prisma.trend.findMany({
    where: { briefs: { none: {} } },
    orderBy: { opportunityScore: "desc" },
    take: 3
  });

  if (trends.length === 0) {
    return res.json({ message: "No available trends to generate briefs for.", briefs: [] });
  }

  const generatedBriefs = [];

  for (const trend of trends) {
    try {
      const prompt = buildBriefPrompt(trend);
      const briefData = await callQwenJSON(prompt, userApiKey);

      const brief = await prisma.brief.create({
        data: {
          trendId: trend.id,
          summary: briefData.summary,
          audienceAnalysis: briefData.audienceAnalysis,
          angle: briefData.angle,
          seoKeywords: briefData.seoKeywords ?? [],
          h1: briefData.h1,
          headingStructure: briefData.headingStructure,
          wordCount: briefData.recommendedWordCount,
          publishingGuidance: briefData.publishingGuidance,
          status: "PENDING",
        },
        include: {
          trend: {
            select: { title: true, opportunityScore: true, source: true }
          }
        }
      });
      generatedBriefs.push(brief);
    } catch (e) {
      console.error(`Error generating brief for trend ${trend.id}:`, e.message);
    }
  }

  return res.status(201).json({ count: generatedBriefs.length, briefs: generatedBriefs });
}