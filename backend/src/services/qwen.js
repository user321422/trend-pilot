import { withTimeout, withRetry } from '../middleware/errorHandler.js';

// Base Qwen API URL.
// Supported base URLs from Qwen / Alibaba Cloud Model Studio:
// 1. Standard DashScope Endpoint: 
//    https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
// 2. OpenAI Compatible Base URL:
//    https://dashscope-intl.aliyuncs.com/compatible-mode/v1
// 3. OpenAI Compatible (Token Plan):
//    https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1
// 4. Anthropic Compatible (Token Plan):
//    https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://ws-opzbykxprs64ym8l.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen3.7-plus';
const TIMEOUT_MS = 60000; // 60s per attempt to allow for long brief generation
const MAX_RETRIES = 3;

/**
 * Core caller helper that handles standard DashScope, OpenAI-compatible, and Anthropic-compatible endpoints.
 */
async function callQwenApi(messages, apiKey) {
  const isAnthropic = QWEN_API_URL.includes('/apps/anthropic') || QWEN_API_URL.includes('/anthropic');
  const isOpenAI = QWEN_API_URL.includes('/compatible-mode/v1') || QWEN_API_URL.includes('/chat/completions');

  let targetUrl = QWEN_API_URL;
  let headers = {
    'Content-Type': 'application/json',
  };
  let bodyPayload = {};

  if (isAnthropic) {
    // Anthropic-compatible mode: e.g. for https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic
    if (!QWEN_API_URL.includes('/v1/messages')) {
      targetUrl = QWEN_API_URL.endsWith('/')
        ? `${QWEN_API_URL}v1/messages`
        : `${QWEN_API_URL}/v1/messages`;
    }
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    bodyPayload = {
      model: QWEN_MODEL,
      messages: messages,
      max_tokens: 4096
    };
  } else if (isOpenAI) {
    // OpenAI-compatible mode: e.g. for https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    if (!QWEN_API_URL.includes('/chat/completions')) {
      targetUrl = QWEN_API_URL.endsWith('/')
        ? `${QWEN_API_URL}chat/completions`
        : `${QWEN_API_URL}/chat/completions`;
    }
    headers['Authorization'] = `Bearer ${apiKey}`;
    bodyPayload = {
      model: QWEN_MODEL,
      messages: messages
    };
  } else {
    // Standard DashScope mode: e.g. for https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
    headers['Authorization'] = `Bearer ${apiKey}`;
    bodyPayload = {
      model: QWEN_MODEL,
      input: { messages: messages },
      parameters: { result_format: 'message' }
    };
  }

  const response = await withTimeout(
    fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    }),
    TIMEOUT_MS,
    'Qwen API call'
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen API error ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (isAnthropic) {
    return data?.content?.[0]?.text ?? '';
  } else if (isOpenAI) {
    return data?.choices?.[0]?.message?.content ?? '';
  } else {
    return data?.output?.choices?.[0]?.message?.content ?? '';
  }
}

/**
 * Calls Qwen and returns parsed JSON.
 * - Strips ```json fences automatically
 * - Retries up to 3 times with exponential backoff
 * - Times out each attempt at 60s
 * - Falls back to mock if API key is not set
 */
function isPlaceholderKey(key) {
  if (!key) return true;
  const clean = key.trim().toLowerCase();
  return (
    clean === 'your-qwen-api-key' ||
    clean === '' ||
    clean.startsWith('your-') ||
    clean.includes('placeholder') ||
    clean.includes('api-key')
  );
}

function getMockTrendScoring(prompt) {
  const titleMatch = prompt.match(/Title:\s*"([^"]+)"/);
  const topicMatch = prompt.match(/Topic:\s*(.+)/);
  const title = titleMatch?.[1] ?? topicMatch?.[1]?.trim() ?? 'Emerging Trend';
  return {
    relevanceScore: Math.floor(Math.random() * 30) + 70, // 70-100
    opportunityScore: Math.floor(Math.random() * 30) + 65, // 65-95
    aiExplanation: `This topic "${title}" is highly relevant to our SaaS/B2B tech audience. We should target this trend early to capture search traffic before it saturates.`,
  };
}

function getMockResponseForPrompt(prompt) {
  if (prompt.includes('Agent 1') || prompt.includes('Trend Scorer')) {
    return getMockTrendScoring(prompt);
  }
  if (prompt.includes('content editor') || prompt.includes('Review this draft')) {
    return {
      briefComplianceScore: 92,
      aiNotes: 'The draft follows all target keywords and instructions perfectly. Structure is solid.'
    };
  }
  if (prompt.includes('Rank these writers')) {
    const ids = [...prompt.matchAll(/"writerId":\s*"([^"]+)"/g)].map(m => m[1]);
    if (ids.length > 0) {
      return ids.map(id => ({
        writerId: id,
        matchScore: 85,
        reasoning: "Selected based on expertise match and workload availability."
      }));
    }
  }
  return getMockBrief(prompt);
}

/**
 * Calls Qwen and returns parsed JSON.
 * - Strips ```json fences automatically
 * - Retries up to 3 times with exponential backoff
 * - Times out each attempt at 60s
 * - Falls back to mock if API key is not set or if the API call throws an exception
 */
async function callQwenJSON(prompt, userApiKey) {
  const apiKey = userApiKey || process.env.QWEN_API_KEY;
  if (isPlaceholderKey(apiKey)) {
    console.warn('[Qwen] No valid API key found — using mock response');
    return getMockResponseForPrompt(prompt);
  }

  try {
    return await withRetry(async () => {
      const messages = [{ role: 'user', content: prompt }];
      const raw = await callQwenApi(messages, apiKey);

      // Strip ```json fences if model added them
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new Error(`Qwen returned invalid JSON: ${cleaned.slice(0, 200)}`);
      }
    }, MAX_RETRIES);
  } catch (error) {
    console.warn(`[Qwen] API JSON call failed: ${error.message} — falling back to mock response`);
    return getMockResponseForPrompt(prompt);
  }
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

async function callQwenChat(messages, userApiKey) {
  const apiKey = userApiKey || process.env.QWEN_API_KEY;
  if (isPlaceholderKey(apiKey)) {
    console.warn('[Qwen] No valid API key found — using mock chat response');
    return "This is a mock chat response. Please add your API key in the settings to enable the real AI assistant.";
  }

  try {
    return await withRetry(async () => {
      return await callQwenApi(messages, apiKey);
    }, MAX_RETRIES);
  } catch (error) {
    console.warn(`[Qwen] API chat call failed: ${error.message} — falling back to mock chat response`);
    return "This is a mock chat response. Please add your API key in the settings to enable the real AI assistant.";
  }
}

export { callQwenJSON, callQwenChat };
