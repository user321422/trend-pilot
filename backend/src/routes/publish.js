import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { schedulePublish, generateSocial, exportContent } from '../controllers/publishController.js';

const router = Router();

// ── Zod schemas ───────────────────────────────────────────────────────────────
const scheduleSchema = z.object({
  briefId: z.string().min(1, 'briefId is required'),
});

const socialSchema = z.object({
  draftId: z.string().min(1, 'draftId is required'),
});

// ── Validation middleware factory ─────────────────────────────────────────────
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data; // use parsed/coerced data
    next();
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /publish/schedule — Admin/Editor only
router.post(
  '/schedule',
  requireAuth,
  validate(scheduleSchema),
  asyncHandler(schedulePublish)
);

// POST /publish/social
router.post(
  '/social',
  requireAuth,
  validate(socialSchema),
  asyncHandler(generateSocial)
);

// GET /publish/export?draftId=xxx
router.get(
  '/export',
  requireAuth,
  asyncHandler(exportContent)
);

export default router;