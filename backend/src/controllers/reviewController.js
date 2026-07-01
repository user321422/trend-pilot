import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "../services/qwen.js";

const prisma = new PrismaClient();

// Heuristic: keyword coverage — no AI needed
function computeKeywordCoverage(content, keywords) {
  if (!keywords || keywords.length === 0) return 100;
  const lower = content.toLowerCase();
  const found = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return Math.round((found.length / keywords.length) * 100);
}

// Heuristic: readability — average sentence length proxy
function computeReadabilityScore(content) {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const avgWords =
    sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) /
    sentences.length;
  // Ideal avg sentence length is 15-20 words — score drops outside that range
  if (avgWords <= 20) return Math.round((avgWords / 20) * 100);
  return Math.round(Math.max(0, 100 - (avgWords - 20) * 3));
}

// Structural: find missing sections from brief headingStructure
function findMissingSections(content, headingStructure) {
  if (!headingStructure || !Array.isArray(headingStructure)) return [];
  const lower = content.toLowerCase();
  return headingStructure
    .filter((h) => !lower.includes(h.h2.toLowerCase()))
    .map((h) => h.h2);
}

// POST /reviews/analyze
export async function analyzeDraft(req, res) {
  const { draftId } = req.body;
  const userApiKey = req.headers['x-api-key'];

  if (!draftId) {
    return res.status(400).json({ error: "draftId is required" });
  }

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: true,
        },
      },
    },
  });

  if (!draft) return res.status(404).json({ error: "Draft not found" });
  if (!draft.content || draft.content.trim().length < 50) {
    return res.status(400).json({ error: "Draft content is too short to review" });
  }

  const brief = draft.assignment.brief;

  // Heuristic checks — fast, no AI
  const keywordCoverage = computeKeywordCoverage(draft.content, brief.seoKeywords);
  const readabilityScore = computeReadabilityScore(draft.content);
  const missingSections = findMissingSections(draft.content, brief.headingStructure);
  const seoComplianceScore = Math.round((keywordCoverage + (missingSections.length === 0 ? 100 : 50)) / 2);

  // AI judgment — only for brief compliance (worth the API call)
  const compliancePrompt = `You are a content editor. Review this draft against the brief and return ONLY valid JSON:
{
  "briefComplianceScore": number between 0 and 100,
  "aiNotes": "string with 2-3 sentences of specific feedback"
}

Brief angle: ${brief.angle}
Brief h1: ${brief.h1}
Draft (first 500 chars): ${draft.content.slice(0, 500)}`;

  const aiResult = await callQwenJSON(compliancePrompt, userApiKey);

  // Save review
  const review = await prisma.review.upsert({
    where: { draftId },
    update: {
      seoComplianceScore,
      readabilityScore,
      keywordCoverage,
      missingSections,
      briefComplianceScore: aiResult.briefComplianceScore,
      aiNotes: aiResult.aiNotes,
    },
    create: {
      draftId,
      seoComplianceScore,
      readabilityScore,
      keywordCoverage,
      missingSections,
      briefComplianceScore: aiResult.briefComplianceScore,
      aiNotes: aiResult.aiNotes,
    },
  });

  // Mark draft as submitted
  await prisma.draft.update({
    where: { id: draftId },
    data: { submittedAt: new Date() },
  });

  // Update assignment status to COMPLETED and update writer load/stats
  const assignment = await prisma.assignment.findUnique({
    where: { id: draft.assignmentId }
  });

  if (assignment && assignment.status !== 'COMPLETED') {
    await prisma.assignment.update({
      where: { id: draft.assignmentId },
      data: { status: 'COMPLETED' }
    });

    const currentWriter = await prisma.user.findUnique({ where: { id: assignment.writerId } });
    const newLoad = currentWriter ? Math.max(0, currentWriter.currentLoad - 1) : 0;
    
    await prisma.user.update({
      where: { id: assignment.writerId },
      data: {
        currentLoad: newLoad,
        completedCount: { increment: 1 }
      }
    });
  }

  return res.json({ review });
}

// POST /reviews/submit-draft — writer submits draft content
export async function submitDraft(req, res) {
  const { draftId, content } = req.body;

  if (!draftId || !content) {
    return res.status(400).json({ error: "draftId and content are required" });
  }

  const draft = await prisma.draft.update({
    where: { id: draftId },
    data: { content },
  });

  return res.json({ draft });
}