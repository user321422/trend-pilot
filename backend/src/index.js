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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Centralized error handler — MUST be last ──────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`TrendPilot backend running at http://localhost:${PORT}`));
