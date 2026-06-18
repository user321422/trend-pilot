import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "../services/qwen.js";

const prisma = new PrismaClient();

export async function generateBrief(req, res) {
  const { trendId } = req.body;

  if (!trendId) {
    return res.status(400).json({ error: "trendId is required" });
  }

  const trend = await prisma.trend.findUnique({ where: { id: trendId } });
  if (!trend) {
    return res.status(404).json({ error: "Trend not found" });
  }

  const prompt = `You are a content strategist. Given the trending topic below, return ONLY valid JSON with no markdown, no commentary, no extra text. Use exactly this shape:
{
  "summary": "string",
  "audienceAnalysis": "string",
  "angle": "string",
  "seoKeywords": ["string"],
  "h1": "string",
  "headingStructure": [{ "h2": "string", "h3": ["string"] }],
  "recommendedWordCount": number
}

Topic: ${trend.title}
Trend context: ${trend.aiExplanation ?? "No additional context available."}`;

  const briefData = await callQwenJSON(prompt);

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
      status: "PENDING",
    },
  });

  return res.status(201).json({ brief });
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