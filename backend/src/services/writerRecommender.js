// backend/src/services/writerRecommender.js

import { callQwenJSON } from './qwen.js';

export async function recommendWriters(brief, writers, userApiKey) {
    try {
        const ranked = await scoreWithAI(brief, writers, userApiKey);
        console.log('[writerRecommender] AI scoring succeeded');
        return ranked;
    } catch (err) {
        console.warn('[writerRecommender] AI scoring failed, using mock fallback:', err.message);
        return scoreWithMock(writers);
    }
}

// ── AI Scorer ──────────────────────────────────────────────────────────────
async function scoreWithAI(brief, writers, userApiKey) {
    const prompt = `
You are an AI content operations assistant for TrendPilot.

Rank these writers for the following content brief.

## Brief
- Title: "${brief.h1 ?? brief.title ?? 'Untitled'}"
- Angle: "${brief.angle ?? 'N/A'}"
- SEO Keywords: ${JSON.stringify(brief.seoKeywords ?? [])}

## Writers
${JSON.stringify(writers.map(w => ({
        writerId: w.id,
        name: w.name,
        email: w.email,
        currentLoad: w.currentLoad,
        completedCount: w.completedCount,
        avgReviewScore: w.avgReviewScore,
    })), null, 2)}

## Scoring (0–100)
1. Availability (40%): currentLoad 0=100pts, 1=85pts, 2=60pts, 3+=20pts
2. Track record (40%): avgReviewScore + completedCount (cap at 20)
3. Topic fit (20%): infer from name/email vs brief keywords

Return ONLY a valid JSON array, no markdown, no explanation:
[{ "writerId": "...", "matchScore": 0-100, "reasoning": "1-2 sentences" }]

Sort by matchScore descending. Include every writer.
`.trim();

    const result = await callQwenJSON(prompt, userApiKey);
    return mergeScoresWithWriters(result, writers);
}

// ── Mock Fallback ──────────────────────────────────────────────────────────
function scoreWithMock(writers) {
    return writers
        .map((w) => {
            const availability = (100 - w.currentLoad * 15) * 0.4;
            const trackRecord = w.avgReviewScore * 0.4;
            const experience = Math.min(w.completedCount, 20) * 0.5 * 0.2;
            const matchScore = Math.min(100, Math.max(0, Math.round(availability + trackRecord + experience)));

            return {
                writerId: w.id,
                name: w.name,
                email: w.email,
                currentLoad: w.currentLoad,
                completedCount: w.completedCount,
                avgReviewScore: w.avgReviewScore,
                matchScore,
                reasoning: buildReasoning(w, matchScore),
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore);
}

function buildReasoning(writer, score) {
    if (writer.currentLoad >= 3)
        return `${writer.name} is overloaded with ${writer.currentLoad} active assignments and is not recommended.`;
    if (writer.currentLoad === 0 && writer.avgReviewScore >= 80)
        return `${writer.name} is fully available with a strong review score of ${writer.avgReviewScore}, making them an excellent fit.`;
    if (writer.completedCount <= 3)
        return `${writer.name} is available but has limited experience (${writer.completedCount} completed). Suitable for lower-priority briefs.`;
    return `${writer.name} has completed ${writer.completedCount} assignments with an average score of ${writer.avgReviewScore}. A reliable choice.`;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function mergeScoresWithWriters(aiScores, writers) {
    const writerMap = new Map(writers.map((w) => [w.id, w]));

    return aiScores
        .map((score) => {
            const writer = writerMap.get(score.writerId);
            if (!writer) return null;
            return {
                writerId: writer.id,
                name: writer.name,
                email: writer.email,
                currentLoad: writer.currentLoad,
                completedCount: writer.completedCount,
                avgReviewScore: writer.avgReviewScore,
                matchScore: score.matchScore,
                reasoning: score.reasoning,
            };
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);
}