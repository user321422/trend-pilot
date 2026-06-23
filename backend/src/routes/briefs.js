import { Router } from "express";
import { generateBrief, approveBrief, getBriefs, autoGenerateBriefs } from "../controllers/briefController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(getBriefs));
router.post("/generate", requireAuth, asyncHandler(generateBrief));
router.post("/auto-generate", requireAuth, asyncHandler(autoGenerateBriefs));
router.patch("/approve", requireAuth, asyncHandler(approveBrief));

export default router;