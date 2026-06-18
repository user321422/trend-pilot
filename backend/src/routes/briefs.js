import { Router } from "express";
import { generateBrief, approveBrief } from "../controllers/briefController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/generate", requireAuth, asyncHandler(generateBrief));
router.patch("/approve", requireAuth, requireRole("ADMIN", "EDITOR"), asyncHandler(approveBrief));

export default router;