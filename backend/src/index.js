import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import trendRoutes from './routes/trends.js';
import briefRoutes from './routes/briefs.js';
import assignmentRoutes from './routes/assignments.js';
import reviewRoutes from './routes/reviews.js';
import publishRoutes from './routes/publish.js';
import chatRoutes from './routes/chat.js';
import orchestratorRoutes from './routes/orchestrator.js';
import { fetchAndStoreTrends } from './services/trendFetcher.js';
import { startOrchestrator, runFullAutonomousCycle } from './services/autonomousOrchestrator.js';
import { initializeScheduler } from './services/trendScheduler.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Register routes ───────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/trends', trendRoutes);
app.use('/briefs', briefRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/publish', publishRoutes);
app.use('/chat', chatRoutes);
app.use('/orchestrator', orchestratorRoutes);

// ── Welcome & Health check ──────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ 
  name: 'Trendy API', 
  version: '1.0.0', 
  status: 'active',
  health: '/health' 
}));
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Centralized error handler — MUST be last ──────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Trendy backend running at http://localhost:${PORT}`);
  
  // ── Background Autonomous Orchestrator ─────────────────────────────────────
  // Enabled autonomous background schedules for complete automation.
  startOrchestrator(60); // Start with default (60 mins)

  // Initialize and start background trend sync scheduler from database config
  initializeScheduler().catch((error) => {
    console.error("[Scheduler] Failed to initialize trend scheduler on startup:", error);
  });
  
  // Run once on startup after a small delay
  setTimeout(async () => {
    try {
      console.log("[Orchestrator] Running initial autonomous cycle on startup...");
      await runFullAutonomousCycle();
    } catch (error) {
      console.error("[Orchestrator] Initial cycle failed:", error);
    }
  }, 5000);
});
