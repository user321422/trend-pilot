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
      draft: { select: { id: true, submittedAt: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  return res.json({ count: assignments.length, assignments });
}