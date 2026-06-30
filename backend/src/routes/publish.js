import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { schedulePublish, generateSocial, exportContent, dispatchPublish, verifyTarget } from '../controllers/publishController.js';

const router = Router();

// ── Zod schemas ───────────────────────────────────────────────────────────────
const scheduleSchema = z.object({
  briefId: z.string().min(1, 'briefId is required'),
});

const socialSchema = z.object({
  draftId: z.string().min(1, 'draftId is required'),
});

const dispatchSchema = z.object({
  draftId: z.string().min(1, 'draftId is required'),
  targets: z.object({
    medium: z.object({ enabled: z.boolean(), token: z.string().optional() }).optional(),
    devto: z.object({ enabled: z.boolean(), apiKey: z.string().optional() }).optional(),
    webhook: z.object({ enabled: z.boolean(), url: z.string().optional(), secret: z.string().optional() }).optional(),
    wordpress: z.object({ enabled: z.boolean(), url: z.string().optional(), username: z.string().optional(), password: z.string().optional() }).optional(),
    ghost: z.object({ enabled: z.boolean(), url: z.string().optional(), apiKey: z.string().optional() }).optional(),
    linkedin: z.object({ enabled: z.boolean(), token: z.string().optional() }).optional(),
    twitter: z.object({ enabled: z.boolean(), apiKey: z.string().optional() }).optional(),
  }).optional()
});

const verifySchema = z.object({
  type: z.enum(['medium', 'devto', 'webhook', 'wordpress', 'ghost', 'linkedin', 'twitter']),
  credentials: z.object({
    token: z.string().optional(),
    apiKey: z.string().optional(),
    url: z.string().optional(),
    secret: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional()
  })
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

// POST /publish/schedule
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

// POST /publish/dispatch
router.post(
  '/dispatch',
  requireAuth,
  validate(dispatchSchema),
  asyncHandler(dispatchPublish)
);

// POST /publish/verify-target
router.post(
  '/verify-target',
  requireAuth,
  validate(verifySchema),
  asyncHandler(verifyTarget)
);

export default router;