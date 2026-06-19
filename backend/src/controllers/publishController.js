import prisma from '../services/prisma.js';
import { suggestPublishSchedule, generateSocialPosts, buildExportPayload } from '../services/publishService.js';

// ──────────────────────────────────────────────────────────────────────────────
// POST /publish/schedule
// Body: { briefId }
// Returns a suggested publish date + rationale. No DB write — advisory only.
// ──────────────────────────────────────────────────────────────────────────────
async function schedulePublish(req, res) {
  const { briefId } = req.body; // validated by Zod in route

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: { trend: true },
  });

  if (!brief) return res.status(404).json({ error: 'Brief not found' });
  if (brief.status !== 'APPROVED') {
    return res.status(400).json({ error: 'Brief must be APPROVED before scheduling' });
  }

  const schedule = suggestPublishSchedule(brief.trend, brief);
  return res.json({ briefId, schedule });
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /publish/social
// Body: { draftId }
// Generates LinkedIn + X posts from the submitted draft.
// ──────────────────────────────────────────────────────────────────────────────
async function generateSocial(req, res) {
  const { draftId } = req.body;

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: {
            include: { trend: true },
          },
        },
      },
    },
  });

  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  if (!draft.content) return res.status(400).json({ error: 'Draft has no content yet' });

  const brief = draft.assignment.brief;
  const trend = brief.trend;

  const posts = await generateSocialPosts(draft, brief, trend);
  return res.json({ draftId, posts });
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /publish/export?draftId=xxx
// Returns the full assembled content export object.
// ──────────────────────────────────────────────────────────────────────────────
async function exportContent(req, res) {
  const { draftId } = req.query;

  if (!draftId) return res.status(400).json({ error: 'draftId query param is required' });

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      assignment: {
        include: {
          brief: {
            include: { trend: true },
          },
        },
      },
      review: true, // one-to-one per schema
    },
  });

  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  const review = draft.review;
  if (!review) return res.status(400).json({ error: 'No review found for this draft. Run /reviews/analyze first.' });

  const brief = draft.assignment.brief;
  const trend = brief.trend;

  const payload = buildExportPayload(draft, review, brief, draft.assignment, trend);
  return res.json(payload);
}

export { schedulePublish, generateSocial, exportContent };

