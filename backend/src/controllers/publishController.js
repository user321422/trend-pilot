import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "../services/qwen.js";

const prisma = new PrismaClient();

// POST /publish/schedule
export async function schedulePublish(req, res) {
  const { draftId } = req.body;

  if (!draftId) {
    return res.status(400).json({ error: "draftId is required" });
  }

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { assignment: { include: { brief: { include: { trend: true } } } } },
  });

  if (!draft) return res.status(404).json({ error: "Draft not found" });

  const trend = draft.assignment.brief.trend;

  // Best publish times based on trend score
  const now = new Date();
  const suggestedDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  suggestedDate.setHours(9, 0, 0, 0); // 9am next day

  return res.json({
    draftId,
    trendTitle: trend.title,
    trendScore: trend.trendScore,
    suggestedPublishAt: suggestedDate.toISOString(),
    reason: trend.trendScore > 70
      ? "High trend score — publish within 24 hours to capitalize on momentum"
      : "Moderate trend score — publish within 48 hours for best reach",
    bestTimes: ["9:00 AM", "12:00 PM", "6:00 PM"],
    bestDays: ["Tuesday", "Wednesday", "Thursday"],
  });
}

// POST /publish/social
export async function generateSocialPosts(req, res) {
  const { draftId } = req.body;

  if (!draftId) {
    return res.status(400).json({ error: "draftId is required" });
  }

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { assignment: { include: { brief: true } } },
  });

  if (!draft) return res.status(404).json({ error: "Draft not found" });

  const brief = draft.assignment.brief;

  const prompt = `You are a social media manager. Based on the article below, return ONLY valid JSON with no markdown:
{
  "linkedin": "string (150-200 words, professional tone, ends with a question to drive engagement)",
  "twitter": "string (under 280 chars, punchy, includes 2-3 hashtags)"
}

Article title: ${brief.h1}
Article summary: ${brief.summary}
Key angle: ${brief.angle}
SEO keywords: ${(brief.seoKeywords ?? []).join(", ")}`;

  const posts = await callQwenJSON(prompt);

  return res.json({ draftId, posts });
}

// GET /publish/export/:draftId
export async function exportContent(req, res) {
  const { draftId } = req.params;

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: { include: { trend: true } },
          writer: { select: { name: true, email: true } },
        },
      },
      review: true,
    },
  });

  if (!draft) return res.status(404).json({ error: "Draft not found" });

  const brief = draft.assignment.brief;
  const review = draft.review;

  return res.json({
    export: {
      title: brief.h1,
      summary: brief.summary,
      angle: brief.angle,
      seoKeywords: brief.seoKeywords,
      recommendedWordCount: brief.wordCount,
      content: draft.content,
      author: draft.assignment.writer,
      trend: {
        title: brief.trend.title,
        opportunityScore: brief.trend.opportunityScore,
      },
      review: review
        ? {
            seoComplianceScore: review.seoComplianceScore,
            readabilityScore: review.readabilityScore,
            keywordCoverage: review.keywordCoverage,
            briefComplianceScore: review.briefComplianceScore,
            aiNotes: review.aiNotes,
          }
        : null,
      exportedAt: new Date().toISOString(),
    },
  });
}