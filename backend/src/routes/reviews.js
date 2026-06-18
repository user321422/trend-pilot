import { Router } from "express";
import { analyzeDraft, submitDraft } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/submit-draft", requireAuth, asyncHandler(submitDraft));
router.post("/analyze", requireAuth, asyncHandler(analyzeDraft));

export default router;