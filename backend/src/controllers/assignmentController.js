// backend/src/controllers/assignmentController.js

import { PrismaClient } from "@prisma/client";
import { recommendWriters as runRecommender } from "../services/writerRecommender.js";

const prisma = new PrismaClient();

// ── GET /assignments/recommend?briefId=<id> ────────────────────────────────
export async function recommendWriters(req, res) {
  const { briefId } = req.query;

  if (!briefId) {
    return res.status(400).json({ error: "briefId query parameter is required" });
  }

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      trend: { select: { title: true } }, // ✅ title lives on Trend
    },
  });
  if (!brief) {
    return res.status(404).json({ error: "Brief not found" });
  }

  if (brief.status !== "APPROVED") {
    return res.status(400).json({ error: "Brief must be APPROVED before assigning a writer" });
  }

  const writers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      currentLoad: true,
      completedCount: true,
      avgReviewScore: true,
    },
    orderBy: { currentLoad: "asc" },
  });

  if (writers.length === 0) {
    return res.status(404).json({ error: "No writers found in the system" });
  }

  const recommendations = await runRecommender(brief, writers);

  return res.json({
    briefId,
    briefTitle: brief.trend.title, // ✅ was brief.title
    recommendations,
  });
}

// ── POST /assignments — assign a brief to a writer ─────────────────────────
export async function createAssignment(req, res) {
  const { briefId, writerId } = req.body;

  if (!briefId || !writerId) {
    return res.status(400).json({ error: "briefId and writerId are required" });
  }

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) return res.status(404).json({ error: "Brief not found" });
  if (brief.status !== "APPROVED") {
    return res.status(400).json({ error: "Brief must be APPROVED before assigning" });
  }

  const writer = await prisma.user.findUnique({ where: { id: writerId } });
  if (!writer) return res.status(404).json({ error: "Writer not found" });

  const assignment = await prisma.$transaction(async (tx) => {
    const a = await tx.assignment.create({
      data: { briefId, writerId, status: "ASSIGNED" },
    });

    await tx.draft.create({
      data: { assignmentId: a.id, content: "" },
    });

    await tx.user.update({
      where: { id: writerId },
      data: { currentLoad: { increment: 1 } },
    });

    return a;
  });

  return res.status(201).json({ assignment });
}

// ── GET /assignments — list all assignments ────────────────────────────────
export async function listAssignments(req, res) {
  const assignments = await prisma.assignment.findMany({
    include: {
      brief: {
        select: {
          id: true,
          status: true,
          h1: true,          // ✅ the brief's SEO headline
          angle: true,
          summary: true,
          trend: {
            select: {
              id: true,
              title: true,   // ✅ trend title as the display title
            },
          },
        },
      },
      writer: { select: { id: true, name: true, email: true } },
      draft: {
        include: {
          review: true
        }
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return res.json({ count: assignments.length, assignments });
}

// ── POST /assignments/:id/write — manually trigger AI writer for an assignment ──
export async function triggerAIWrite(req, res) {
  const { id } = req.params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { brief: true, draft: true }
  });

  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found" });
  }

  if (!assignment.draft) {
    return res.status(400).json({ error: "No draft associated with this assignment" });
  }

  // Update status to IN_PROGRESS
  await prisma.assignment.update({
    where: { id },
    data: { status: 'IN_PROGRESS' }
  });

  const prompt = `You are an expert content writer for TrendPilot. Write a full, engaging article based on the following brief.
Title: ${assignment.brief.h1}
Angle: ${assignment.brief.angle}
Keywords: ${assignment.brief.seoKeywords.join(', ')}
Structure: ${JSON.stringify(assignment.brief.headingStructure)}

Write the full markdown content for this article. No conversational filler, just the article content starting with the H1.`;

  try {
    const { callQwenChat } = await import("../services/qwen.js");
    const content = await callQwenChat([{ role: 'user', content: prompt }]);

    await prisma.draft.update({
      where: { id: assignment.draft.id },
      data: {
        content,
        submittedAt: new Date()
      }
    });

    const updated = await prisma.assignment.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: {
        brief: {
          select: {
            id: true,
            status: true,
            h1: true,
            angle: true,
            summary: true,
            trend: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        writer: { select: { id: true, name: true, email: true } },
        draft: {
          include: {
            review: true
          }
        },
      }
    });

    return res.json({ assignment: updated });
  } catch (e) {
    // Reset status on error
    await prisma.assignment.update({
      where: { id },
      data: { status: 'ASSIGNED' }
    });
    console.error("[Manual AI Write] Failed:", e);
    return res.status(500).json({ error: `Failed to write draft: ${e.message}` });
  }
}