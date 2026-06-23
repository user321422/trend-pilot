import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Score a writer against a brief to find best match
function scoreWriter(writer, brief) {
  const expertiseMatch =
    writer.expertiseTags.length === 0
      ? 0
      : writer.expertiseTags.filter((tag) =>
          brief.seoKeywords.some((k) =>
            k.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(k.toLowerCase())
          )
        ).length / writer.expertiseTags.length;

  const availabilityScore = writer.currentLoad < writer.maxLoad ? 1 : 0;
  const performanceScore = writer.historicalRating / 5;

  return expertiseMatch * 0.5 + availabilityScore * 0.3 + performanceScore * 0.2;
}

// GET /assignments/recommend/:briefId — top 3 writer matches
export async function recommendWriters(req, res) {
  const { briefId } = req.params;

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) {
    return res.status(404).json({ error: "Brief not found" });
  }

  if (brief.status !== "APPROVED") {
    return res.status(400).json({ error: "Brief must be APPROVED before assigning a writer" });
  }

  const writers = await prisma.user.findMany();

  const scored = writers
    .map((w) => ({ writer: w, score: scoreWriter(w, brief) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ writer, score }) => ({
      id: writer.id,
      name: writer.name,
      email: writer.email,
      expertiseTags: writer.expertiseTags,
      historicalRating: writer.historicalRating,
      currentLoad: writer.currentLoad,
      maxLoad: writer.maxLoad,
      matchScore: Math.round(score * 100),
    }));

  return res.json({ briefId, recommendations: scored });
}

// POST /assignments — assign a brief to a writer
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
  if (writer.currentLoad >= writer.maxLoad) {
    return res.status(400).json({ error: "Writer is at maximum load" });
  }

  // Create assignment and draft placeholder in one transaction
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

// GET /assignments — list all assignments
export async function listAssignments(req, res) {
  const assignments = await prisma.assignment.findMany({
    include: {
      brief: { select: { id: true, h1: true, status: true } },
      writer: { select: { id: true, name: true, email: true } },
      draft: { select: { id: true, submittedAt: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  return res.json({ count: assignments.length, assignments });
}