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

// POST /trends/refresh — fetch fresh trends and store them
router.post("/refresh", asyncHandler(async (req, res) => {
  const trends = await fetchAndStoreTrends();
  res.json({ message: "Trends refreshed", count: trends.length });
}));

export default router;