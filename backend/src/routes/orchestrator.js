import { Router } from "express";
import { getOrchestratorStatus, runFullAutonomousCycle } from "../services/autonomousOrchestrator.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/status", (req, res) => {
  res.json(getOrchestratorStatus());
});

router.post("/run", asyncHandler(async (req, res) => {
  const status = getOrchestratorStatus();
  if (status.isRunning) {
    return res.status(409).json({ error: "Orchestrator cycle is already running" });
  }
  
  // Trigger asynchronously
  runFullAutonomousCycle().catch((err) => {
    console.error("[Orchestrator Route] Background run failed:", err);
  });

  res.json({ message: "Autonomous pipeline cycle started in the background" });
}));

export default router;
