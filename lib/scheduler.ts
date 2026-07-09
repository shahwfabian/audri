/**
 * Scholarship scrape scheduler.
 * Runs automatically when the Next.js server process is alive.
 *
 * Schedule: nightly at 2 AM (configurable via SCRAPE_CRON env var).
 * Can be disabled by setting DISABLE_SCRAPE_SCHEDULER=true.
 *
 * For production / Vercel, use Vercel Cron Jobs to call POST /api/scholarships/scrape
 * instead of this in-process scheduler.
 */

import cron from "node-cron";
import { runScraper, initSeedDB } from "./scrapers/index";

let initialized = false;

export function startScheduler(): void {
  if (initialized) return;
  initialized = true;

  // Always ensure seed data exists
  try {
    initSeedDB();
  } catch (e) {
    console.warn("[scheduler] Could not initialize seed DB:", e);
  }

  if (process.env.DISABLE_SCRAPE_SCHEDULER === "true") {
    console.log("[scheduler] Disabled via DISABLE_SCRAPE_SCHEDULER env var.");
    return;
  }

  const schedule = process.env.SCRAPE_CRON ?? "0 2 * * *"; // Default: 2 AM every day

  if (!cron.validate(schedule)) {
    console.warn(`[scheduler] Invalid cron expression "${schedule}". Scheduler not started.`);
    return;
  }

  cron.schedule(schedule, async () => {
    console.log(`\n[scheduler] 🕑 Nightly scrape starting — ${new Date().toLocaleString()}`);
    try {
      const result = await runScraper("all");
      console.log(`[scheduler] ✅ Scrape complete: ${result.total} scholarships.`);
    } catch (err) {
      console.error("[scheduler] ❌ Scrape failed:", err);
    }
  });

  console.log(`[scheduler] 📅 Scrape scheduled (${schedule}) — next run at 2 AM.`);
}
