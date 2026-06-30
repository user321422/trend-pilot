import { fetchAndStoreTrends } from './trendFetcher.js';
import prisma from './prisma.js';

let syncIntervalId = null;
let currentIntervalMinutes = 60; // default 1 hour, 0 means disabled

export async function startBackgroundSync(minutes) {
  // Clear any existing interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  currentIntervalMinutes = minutes;

  // Persist settings in the database
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'syncIntervalMinutes' },
      update: { value: String(minutes) },
      create: { key: 'syncIntervalMinutes', value: String(minutes) }
    });
  } catch (error) {
    console.error("[Scheduler] Error saving syncIntervalMinutes to database:", error);
  }

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

export async function initializeScheduler() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'syncIntervalMinutes' }
    });

    let minutes = 60; // Default: 1 hour
    if (setting) {
      minutes = parseInt(setting.value, 10);
      console.log(`[Scheduler] Loaded background sync interval from DB: ${minutes} minutes.`);
    } else {
      console.log(`[Scheduler] No sync interval found in DB. Creating default (60 minutes).`);
      await prisma.systemSetting.create({
        data: { key: 'syncIntervalMinutes', value: '60' }
      });
    }

    // Call startBackgroundSync but don't re-save to database (handled internally or we can just pass the value)
    // Actually, calling startBackgroundSync will upsert the same value, which is fine and ensures DB is in sync.
    await startBackgroundSync(minutes);
  } catch (error) {
    console.error("[Scheduler] Failed to initialize scheduler from database, falling back to default 60 minutes:", error);
    await startBackgroundSync(60);
  }
}
