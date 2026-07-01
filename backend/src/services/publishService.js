import { callQwenJSON } from './qwen.js';

function suggestPublishSchedule(trend, brief) {
  const now = new Date();
  let daysFromNow;
  const score = trend.opportunityScore ?? 50;
  if (score >= 70) daysFromNow = 1;
  else if (score >= 40) daysFromNow = 3;
  else daysFromNow = 7;
  const target = new Date(now);
  target.setDate(target.getDate() + daysFromNow);
  const day = target.getDay();
  if (day === 0) target.setDate(target.getDate() + 2);
  else if (day === 1) target.setDate(target.getDate() + 1);
  else if (day === 6) target.setDate(target.getDate() + 2);
  target.setHours(9, 0, 0, 0);
  return {
    suggestedPublishAt: target.toISOString(),
    rationale: score >= 70 ? 'High opportunity score — publish within 24h to maximize trend momentum.' : score >= 40 ? 'Medium opportunity score — 2-3 days allows polish without missing the window.' : 'Lower opportunity score — schedule for next week.',
    recommendedTimeUTC: '09:00-11:00 UTC',
    recommendedDays: 'Tuesday-Thursday',
  };
}

async function generateSocialPosts(draft, brief, trend, userApiKey) {
  const excerpt = draft.content?.slice(0, 400) ?? '';
  const prompt = `You are a social media copywriter. Given a published article, generate two social media posts.\n\nArticle title (H1): ${brief.h1 ?? brief.summary}\nTarget keywords: ${brief.seoKeywords?.join(', ') ?? ''}\nArticle excerpt (first 400 chars): ${excerpt}\nTrend topic: ${trend.title}\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "linkedin": { "post": "string", "hashtags": ["string"] },\n  "twitter": { "post": "string (max 280 chars)", "hashtags": ["string"] }\n}`;
  try {
    return await callQwenJSON(prompt, userApiKey);
  } catch (err) {
    const title = brief.h1 ?? brief.summary ?? trend.title;
    const kw = brief.seoKeywords?.[0] ?? trend.title;
    return {
      linkedin: { post: `Trends move fast. We published a deep-dive on "${title}". Read the full piece in comments. #ContentStrategy #${kw.replace(/\s+/g, '')} #Trendy`, hashtags: ['ContentStrategy', kw.replace(/\s+/g, ''), 'Trendy'] },
      twitter: { post: `"${title}" is trending and we wrote the definitive take. #${kw.replace(/\s+/g, '')} #ContentStrategy`, hashtags: [kw.replace(/\s+/g, ''), 'ContentStrategy'] },
      _mock: true,
    };
  }
}

function buildExportPayload(draft, review, brief, assignment, trend) {
  return {
    meta: { exportedAt: new Date().toISOString(), trendTitle: trend.title, opportunityScore: trend.opportunityScore, briefStatus: brief.status },
    content: { h1: brief.h1, headingStructure: brief.headingStructure, seoKeywords: brief.seoKeywords, recommendedWordCount: brief.wordCount, body: draft.content, actualWordCount: draft.content?.split(/\s+/).length ?? 0 },
    quality: { seoComplianceScore: review.seoComplianceScore, readabilityScore: review.readabilityScore, keywordCoverage: review.keywordCoverage, briefComplianceScore: review.briefComplianceScore, missingSections: review.missingSections, aiNotes: review.aiNotes },
    assignment: { writerId: assignment.writerId, assignedAt: assignment.assignedAt, draftSubmittedAt: draft.submittedAt },
  };
}

export { suggestPublishSchedule, generateSocialPosts, buildExportPayload };