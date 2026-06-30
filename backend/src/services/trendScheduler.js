import { fetchAndStoreTrends } from './trendFetcher.js';

let syncIntervalId = null;
let currentIntervalMinutes = 60; // default 1 hour, 0 means disabled

export function startBackgroundSync(minutes) {
  // Clear any existing interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  currentIntervalMinutes = minutes;

  if (minutes > 0) {
    const ms = minutes * 60 * 1000;
    console.log(`[Agent 1] Background sync scheduled every ${minutes} minutes.`);
    
    syncIntervalId = setInterval(async () => {
      try {
        console.log("[Agent 1] Running scheduled background sync...");
        await fetchAndStoreTrends();
        console.log("[Agent 1] Background sync complete.");
      } catch (error) {
        console.error("[Agent 1] Background sync failed:", error);
      }
    }, ms);
  } else {
    console.log("[Agent 1] Background sync is currently DISABLED.");
  }
}

export function getSyncInterval() {
  return currentIntervalMinutes;
}
