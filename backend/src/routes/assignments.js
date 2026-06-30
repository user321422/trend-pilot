// backend/src/routes/assignments.js

import { Router } from "express";
import { createAssignment, recommendWriters, listAssignments, triggerAIWrite } from "../controllers/assignmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listAssignments));
router.get("/recommend", requireAuth, asyncHandler(recommendWriters)); // ← was /recommend/:briefId
router.post("/", requireAuth, asyncHandler(createAssignment));
router.post("/:id/write", requireAuth, asyncHandler(triggerAIWrite));

export default router;