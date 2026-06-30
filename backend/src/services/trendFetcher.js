import { PrismaClient } from "@prisma/client";
import { callQwenJSON } from "./qwen.js";
const prisma = new PrismaClient();

async function analyzeTrendWithAgent1(trendTitle, source, userApiKey) {
  const prompt = `You are Agent 1, the Trend Scorer for a B2B Tech / SaaS content publication.
Analyze the following trending topic:
Title: "${trendTitle}"
Source: "${source}"

Evaluate this topic and return a JSON object with strictly the following keys:
- "relevanceScore": Number 0-100 (How relevant is this to our tech/SaaS audience?)
- "opportunityScore": Number 0-100 (Is this a saturated topic or a fresh, high-value opportunity?)
- "aiExplanation": String (A 2-3 sentence explanation of why this trend matters and the angle we should take.)`;

  try {
    const result = await callQwenJSON(prompt, userApiKey);
    return {
      relevanceScore: result.relevanceScore ?? 50,
      opportunityScore: result.opportunityScore ?? 50,
      aiExplanation: result.aiExplanation ?? "No explanation generated.",
    };
  } catch (error) {
    console.error(`Agent 1 failed for ${trendTitle}:`, error.message);
    return {
      relevanceScore: 50,
      opportunityScore: 50,
      aiExplanation: "Agent 1 analysis failed. Default scores applied.",
    };
  }
}

async function fetchRedditTrends() {
  const subreddits = ["SaaS", "technology", "artificial", "webdev"];
  const trends = [];
  for (const sub of subreddits) {
    try {
      const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`);
      if (!response.ok) continue;
      const data = await response.json();
      data.data.children.forEach(post => {
        if (!post.data.stickied) {
          trends.push({
            title: post.data.title,
            source: `reddit (r/${sub})`,
            volume: post.data.ups || 10,
            url: `https://reddit.com${post.data.permalink}`
          });
        }
      });
    } catch (error) {
      console.error(`Failed to fetch Reddit trends for r/${sub}:`, error.message);
    }
  }
  return trends;
}

async function fetchHackerNewsTrends() {
  const trends = [];
  try {
    const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    if (!res.ok) throw new Error("Failed to fetch HN top stories");
    const storyIds = await res.json();
    const topIds = storyIds.slice(0, 5); // get top 5
    
    for (const id of topIds) {
      const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (!storyRes.ok) continue;
      const story = await storyRes.json();
      if (story && story.title) {
        trends.push({
          title: story.title,
          source: "hacker_news",
          volume: story.score || 10,
          url: story.url || `https://news.ycombinator.com/item?id=${id}`
        });
      }
    }
  } catch (error) {
    console.error("Hacker News API failed:", error.message);
  }
  return trends;
}

async function fetchDevToTrends() {
  const trends = [];
  try {
    // top=1 fetches articles trending today
    const res = await fetch("https://dev.to/api/articles?top=1&per_page=5");
    if (!res.ok) throw new Error("Failed to fetch Dev.to articles");
    const articles = await res.json();
    
    for (const article of articles) {
      trends.push({
        title: article.title,
        source: "dev.to",
        volume: article.public_reactions_count || 10,
        url: article.url
      });
    }
  } catch (error) {
    console.error("Dev.to API failed:", error.message);
  }
  return trends;
}

export async function fetchAndStoreTrends(userApiKey) {
  console.log("Fetching live trends...");

  const [redditTrends, hnTrendsData, devToTrendsData] = await Promise.all([
    fetchRedditTrends(),
    fetchHackerNewsTrends(),
    fetchDevToTrends()
  ]);

  let rawTrends = [...redditTrends, ...hnTrendsData, ...devToTrendsData];

  if (rawTrends.length === 0) {
    console.log("No live trends found, returning empty.");
    return [];
  }

  // To prevent the request from timing out while waiting for the AI to analyze all topics,
  // limit the number of trends to process in this run to 10.
  // We'll shuffle them to ensure a mix of sources when limiting
  rawTrends = rawTrends.sort(() => 0.5 - Math.random()).slice(0, 10);

  // Calculate global max volume for normalization
  const sourceMax = Math.max(...rawTrends.map((t) => t.volume));
  
  const stored = await Promise.all(
    rawTrends.map(async (raw) => {
      const trendScore = Math.min((raw.volume / (sourceMax || 1)) * 100, 100);

      const aiAnalysis = await analyzeTrendWithAgent1(raw.title, raw.source, userApiKey);

      return prisma.trend.upsert({
        where: { id: (await prisma.trend.findFirst({ where: { title: raw.title } }))?.id ?? "none" },
        update: {
          trendScore,
          relevanceScore: aiAnalysis.relevanceScore,
          opportunityScore: aiAnalysis.opportunityScore,
          aiExplanation: aiAnalysis.aiExplanation,
          source: raw.source
        },
        create: {
          title: raw.title,
          source: raw.source,
          rawData: raw,
          trendScore,
          relevanceScore: aiAnalysis.relevanceScore,
          opportunityScore: aiAnalysis.opportunityScore,
          aiExplanation: aiAnalysis.aiExplanation,
        },
      });
    })
  );

  console.log(`Stored ${stored.length} live trends.`);
  return stored;
}