#!/usr/bin/env tsx
/**
 * Audri Scholarship Scraper
 * Run: npm run scrape
 * Run single source: npm run scrape -- --source=fastweb
 * Seed only (no network): npm run scrape -- --source=seed-only
 */

import { runScraper, type ScrapeSource } from "../lib/scrapers/index";

const args = process.argv.slice(2);
const sourceArg = args.find((a) => a.startsWith("--source="))?.split("=")[1];
const source: ScrapeSource =
  sourceArg === "scholarships-com" ||
  sourceArg === "fastweb" ||
  sourceArg === "how2win" ||
  sourceArg === "seed-only"
    ? (sourceArg as ScrapeSource)
    : "all";

(async () => {
  try {
    const result = await runScraper(source);
    console.log(`\nDone. ${result.total} scholarships in database.`);
    if (result.errors.length) {
      console.log("Errors:", result.errors);
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error("Fatal scraper error:", err);
    process.exit(1);
  }
})();
