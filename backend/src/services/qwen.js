import { withTimeout, withRetry } from '../middleware/errorHandler.js';

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const TIMEOUT_MS = 15000; // 15s per attempt
const MAX_RETRIES = 3;

/**
 * Calls Qwen and returns parsed JSON.
 * - Strips ```json fences automatically
 * - Retries up to 3 times with exponential backoff
 * - Times out each attempt at 15s
 * - Falls back to mock if QWEN_API_KEY is not set
 */
async function callQwenJSON(prompt) {
  if (!process.env.QWEN_API_KEY) {
    console.warn('[Qwen] No QWEN_API_KEY found — using mock response');
    return getMockBrief(prompt);
  }

  return withRetry(async () => {
    const response = await withTimeout(
      fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: { messages: [{ role: 'user', content: prompt }] },
          parameters: { result_format: 'message' },
        }),
      }),
      TIMEOUT_MS,
      'Qwen API call'
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Qwen API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const raw = data?.output?.choices?.[0]?.message?.content ?? '';

    // Strip ```json fences if model added them
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error(`Qwen returned invalid JSON: ${cleaned.slice(0, 200)}`);
    }
  }, MAX_RETRIES);
}

// ── Mock fallback ─────────────────────────────────────────────────────────────
function getMockBrief(prompt) {
  const topicMatch = prompt.match(/Topic:\s*(.+)/);
  const topic = topicMatch?.[1]?.trim() ?? 'Emerging Tech Trends';

  return {
    summary: `A comprehensive analysis of ${topic} and its implications for content teams.`,
    audienceAnalysis: 'Tech-savvy professionals and content marketers aged 25–45 seeking actionable insights.',
    angle: `Why ${topic} is reshaping the content landscape — and what to do about it.`,
    seoKeywords: [topic.toLowerCase(), 'content strategy', 'AI tools', 'digital marketing', 'trend analysis'],
    h1: `${topic}: What Every Content Team Needs to Know in 2026`,
    headingStructure: [
      { h2: 'What Is Driving This Trend?', h3: ['Key Statistics', 'Industry Context'] },
      { h2: 'Impact on Content Strategy', h3: ['Short-term Changes', 'Long-term Implications'] },
      { h2: 'Actionable Steps for Your Team', h3: ['Quick Wins', 'Strategic Moves'] },
      { h2: 'Tools and Resources', h3: [] },
    ],
    recommendedWordCount: 1500,
    _mock: true,
  };
}

export { callQwenJSON };