export async function callQwenJSON(prompt) {
  // If no API key, return realistic mock data so the app works without Qwen
  if (!process.env.QWEN_API_KEY || process.env.QWEN_API_KEY === "your_actual_qwen_api_key_here") {
    console.log("No Qwen API key — using mock brief data.");
    return {
      summary: "This topic is gaining rapid traction across tech communities and presents a strong content opportunity for early movers.",
      audienceAnalysis: "Tech-savvy professionals aged 25-40 who follow industry trends and are looking for actionable insights.",
      angle: "How this trend will reshape the industry in the next 12 months and what teams should do now.",
      seoKeywords: ["AI tools", "tech trends", "digital transformation", "startup strategy", "2026 trends"],
      h1: "Why This Trend Is the Biggest Opportunity for Tech Teams Right Now",
      headingStructure: [
        { h2: "What Is Driving This Trend", h3: ["Key data points", "Who is leading it"] },
        { h2: "How It Affects Your Industry", h3: ["Short term impact", "Long term outlook"] },
        { h2: "What You Should Do Now", h3: ["Quick wins", "Strategic moves"] },
        { h2: "Conclusion", h3: [] }
      ],
      recommendedWordCount: 1500,
    };
  }

  // Real Qwen call — used when API key is set
  const response = await fetch(process.env.QWEN_BASE_URL + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.QWEN_API_KEY,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("Qwen API error: " + err);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Qwen returned invalid JSON: " + clean);
  }
}