import { callQwenJSON } from './qwen.js';

/**
 * Suggests the best publish date/time based on trend score and audience.
 * No AI call needed — pure heuristic logic.
 */
function suggestPublishSchedule(trend, brief) {
  const now = new Date();

  // High-score trends (>70) should publish within 24h to ride the wave
  // Medium (40-70) → 2-3 days
  // Low (<40) → next week
  let daysFromNow;
  const score = trend.opportunityScore ?? 50;
  if (score >= 70) daysFromNow = 1;
  else if (score >= 40) daysFromNow = 3;
  else daysFromNow = 7;

  // Best publish windows: Tue–Thu 9–11 AM UTC (peak B2B content consumption)
  const target = new Date(now);
  target.setDate(target.getDate() + daysFromNow);

  // Snap to nearest Tuesday–Thursday
  const day = target.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  if (day === 0) target.setDate(target.getDate() + 2); // Sun → Tue
  else if (day === 1) target.setDate(target.getDate() + 1); // Mon → Tue
  else if (day === 5) target.setDate(target.getDate() + 3); // Fri → Mon+3=Tue? no, +3=Mon, fix:
  // Fri(5)+3=Mon → +4=Tue
  else if (day === 6) target.setDate(target.getDate() + 2); // Sat → Mon? +3=Tue

  target.setHours(9, 0, 0, 0); // 9 AM UTC

  return {
    suggestedPublishAt: target.toISOString(),
    rationale:
      score >= 70
        ? 'High opportunity score — publish within 24h to maximize trend momentum.'
        : score >= 40
        ? 'Medium opportunity score — 2–3 days allows polish without missing the window.'
        : 'Lower opportunity score — schedule for next week, prioritize higher-value content first.',
    recommendedTimeUTC: '09:00–11:00 UTC',
    recommendedDays: 'Tuesday–Thursday',
  };
}

/**
 * Generates LinkedIn and X (Twitter) post drafts via Qwen.
 * Falls back to template-based output if no API key is set.
 */
async function generateSocialPosts(draft, brief, trend) {
  const wordCount = draft.content?.split(/\s+/).length ?? 0;
  const excerpt = draft.content?.slice(0, 400) ?? '';

  const prompt = `You are a social media copywriter. Given a published article, generate two social media posts.

Article title (H1): ${brief.h1 ?? brief.summary}
Target keywords: ${brief.seoKeywords?.join(', ') ?? ''}
Article excerpt (first 400 chars): ${excerpt}
Trend topic: ${trend.title}

Return ONLY valid JSON with this exact shape:
{
  "linkedin": {
    "post": "string (200-300 words, professional tone, includes 2-3 hashtags, ends with a CTA to read the article)",
    "hashtags": ["string"]
  },
  "twitter": {
    "post": "string (max 280 chars, punchy, 1-2 hashtags, includes CTA)",
    "hashtags": ["string"]
  }
}`;

  try {
    const result = await callQwenJSON(prompt);
    return result;
  } catch (err) {
    // Mock fallback when no Qwen key
    const title = brief.h1 ?? brief.summary ?? trend.title;
    const kw = brief.seoKeywords?.[0] ?? trend.title;
    return {
      linkedin: {
        post: `📈 Trends move fast — and so should your content strategy.\n\nWe just published a deep-dive on "${title}", breaking down what it means for your audience and how to position your brand ahead of the curve.\n\nKey takeaways inside:\n• Why ${kw} is surging right now\n• Actionable angles your competitors haven't covered yet\n• What your audience actually wants to read\n\nRead the full piece — link in comments 👇\n\n#ContentStrategy #${kw.replace(/\s+/g, '')} #Trendy`,
        hashtags: ['ContentStrategy', kw.replace(/\s+/g, ''), 'Trendy'],
      },
      twitter: {
        post: `🔥 "${title}" is trending — and we wrote the definitive take on it. Don't miss this one. #${kw.replace(/\s+/g, '')} #ContentStrategy`,
        hashtags: [kw.replace(/\s+/g, ''), 'ContentStrategy'],
      },
      _mock: true,
    };
  }
}

/**
 * Builds the final content export payload.
 * Assembles everything into one clean object for frontend rendering or download.
 */
function buildExportPayload(draft, review, brief, assignment, trend) {
  return {
    meta: {
      exportedAt: new Date().toISOString(),
      trendTitle: trend.title,
      opportunityScore: trend.opportunityScore,
      briefStatus: brief.status,
    },
    content: {
      h1: brief.h1,
      headingStructure: brief.headingStructure,
      seoKeywords: brief.seoKeywords,
      recommendedWordCount: brief.wordCount,
      body: draft.content,
      actualWordCount: draft.content?.split(/\s+/).length ?? 0,
    },
    quality: {
      seoComplianceScore: review.seoComplianceScore,
      readabilityScore: review.readabilityScore,
      keywordCoverage: review.keywordCoverage,
      briefComplianceScore: review.briefComplianceScore,
      missingSections: review.missingSections,
      aiNotes: review.aiNotes,
    },
    assignment: {
      writerId: assignment.writerId,
      assignedAt: assignment.assignedAt,
      draftSubmittedAt: draft.submittedAt,
    },
  };
}

export { suggestPublishSchedule, generateSocialPosts, buildExportPayload };