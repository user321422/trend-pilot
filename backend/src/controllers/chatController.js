import { callQwenChat } from '../services/qwen.js';

const BLACKLIST_REGEX = /\b(write (a )?(script|program|code|poem|joke)|debug|compile|calculate|recipe for|translate this)\b/i;

export async function handleChat(req, res) {
  const { messages } = req.body;
  const userApiKey = req.headers['x-api-key'];
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Pre-flight check: inspect the user's latest message to save API credits
  const userMessage = messages[messages.length - 1]?.content;
  if (userMessage && BLACKLIST_REGEX.test(userMessage)) {
    return res.json({
      reply: "I am Trendy, a dedicated content operations assistant. This request appears to be outside my scope (e.g., coding, math, or general trivia). I cannot fulfill this request, but I can help you analyze trends and generate content briefs!"
    });
  }

  try {
    let reply = await callQwenChat(messages, userApiKey);

    // Aggressively strip out all emojis regardless of what the AI outputs
    reply = reply.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
