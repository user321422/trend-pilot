import { Router } from "express";
import {
  createAssignment,
  recommendWriters,
  listAssignments,
} from "../controllers/assignmentController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(listAssignments));
router.get("/recommend/:briefId", requireAuth, requireRole("ADMIN", "EDITOR"), asyncHandler(recommendWriters));
router.post("/", requireAuth, requireRole("ADMIN", "EDITOR"), asyncHandler(createAssignment));

export default router;