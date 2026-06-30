import { Router } from "express";
import { getOrchestratorStatus, runFullAutonomousCycle, readSettings, writeSettings } from "../services/autonomousOrchestrator.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/status", (req, res) => {
  res.json(getOrchestratorStatus());
});

router.get("/settings", (req, res) => {
  res.json(readSettings());
});

router.post("/settings", (req, res) => {
  const { autoGenerateBriefs, autoAssignBriefs, autoWriteDrafts, autoReviewDrafts, autoPublish } = req.body;
  
  const currentSettings = readSettings();
  const updatedSettings = {
    autoGenerateBriefs: typeof autoGenerateBriefs === "boolean" ? autoGenerateBriefs : currentSettings.autoGenerateBriefs,
    autoAssignBriefs: typeof autoAssignBriefs === "boolean" ? autoAssignBriefs : currentSettings.autoAssignBriefs,
    autoWriteDrafts: typeof autoWriteDrafts === "boolean" ? autoWriteDrafts : currentSettings.autoWriteDrafts,
    autoReviewDrafts: typeof autoReviewDrafts === "boolean" ? autoReviewDrafts : currentSettings.autoReviewDrafts,
    autoPublish: typeof autoPublish === "boolean" ? autoPublish : currentSettings.autoPublish,
  };
  
  const success = writeSettings(updatedSettings);
  if (success) {
    res.json({ message: "Settings updated successfully", settings: updatedSettings });
  } else {
    res.status(500).json({ error: "Failed to save settings" });
  }
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
