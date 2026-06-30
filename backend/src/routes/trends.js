import { startBackgroundSync, getSyncInterval } from "../services/trendScheduler.js";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler.js";
import { fetchAndStoreTrends } from "../services/trendFetcher.js";

const router = Router();
const prisma = new PrismaClient();

// GET /trends — list all trends sorted by opportunityScore
router.get("/", asyncHandler(async (req, res) => {
  const { sort = "opportunityScore", source } = req.query;

  const validSorts = ["opportunityScore", "trendScore", "relevanceScore", "createdAt"];
  const sortField = validSorts.includes(sort) ? sort : "opportunityScore";

  const trends = await prisma.trend.findMany({
    where: source ? { source } : {},
    orderBy: { [sortField]: "desc" },
  });

  res.json({ count: trends.length, trends });
}));


// GET /trends/config — get the current background sync interval
router.get("/config", asyncHandler(async (req, res) => {
  res.json({ intervalMinutes: getSyncInterval() });
}));

// POST /trends/config — set the background sync interval
router.post("/config", asyncHandler(async (req, res) => {
  const { intervalMinutes } = req.body;
  if (typeof intervalMinutes !== 'number' || intervalMinutes < 0) {
    return res.status(400).json({ error: "intervalMinutes must be a non-negative number" });
  }
  await startBackgroundSync(intervalMinutes);
  res.json({ message: "Background sync interval updated", intervalMinutes });
}));

// GET /trends/:id — single trend detail
router.get("/:id", asyncHandler(async (req, res) => {
  const trend = await prisma.trend.findUnique({
    where: { id: req.params.id },
    include: { briefs: true },
  });

  if (!trend) {
    return res.status(404).json({ error: "Trend not found" });
  }

  res.json(trend);
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const userApiKey = req.headers['x-api-key'];
  const trends = await fetchAndStoreTrends(userApiKey);
  res.json({ message: "Trends refreshed", count: trends.length });
}));

export default router;