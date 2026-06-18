export function computeTrendScore(raw, sourceMax) {
  if (!sourceMax || sourceMax === 0) return 0;
  return Math.min((raw / sourceMax) * 100, 100);
}

export function computeRelevanceScore(title, nicheKeywords) {
  if (!nicheKeywords || nicheKeywords.length === 0) return 50;
  const titleLower = title.toLowerCase();
  const matches = nicheKeywords.filter((k) =>
    titleLower.includes(k.toLowerCase())
  );
  return Math.min((matches.length / nicheKeywords.length) * 100, 100);
}

export function computeOpportunityScore(trendScore, relevanceScore, competitionPenalty = 0) {
  return (
    trendScore * 0.4 +
    relevanceScore * 0.4 +
    (100 - competitionPenalty) * 0.2
  );
}