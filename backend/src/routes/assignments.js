import { Router } from "express";
import { createAssignment, recommendWriters, listAssignments } from "../controllers/assignmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listAssignments));
router.get("/recommend/:briefId", requireAuth, asyncHandler(recommendWriters));
router.post("/", requireAuth, asyncHandler(createAssignment));

export default router;