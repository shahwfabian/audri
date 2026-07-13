/**
 * Scholarship Scraper Orchestrator
 * Runs all scrapers, deduplicates results, merges with seed data,
 * and writes to data/scholarships.json.
 *
 * Run manually: npm run scrape
 * Schedule: Use Windows Task Scheduler or the built-in cron (see server.ts)
 */

import * as fs from "fs";
import * as path from "path";
import { scrapeScholarshipsCom } from "./scholarships-com";
import { scrapeFastweb } from "./fastweb";
import { scrapeHow2Win } from "./how2win";
import { SEED_SCHOLARSHIPS } from "./seed";
import { LOCAL_SCHOLARSHIPS, PLATFORM_SCHOLARSHIPS } from "./local";
import type { ScrapedScholarship, ScholarshipDatabase } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "scholarships.json");

/** Always-on layers: local/state programs + national platform awards. */
export const BUILT_IN_SCHOLARSHIPS = [...LOCAL_SCHOLARSHIPS, ...PLATFORM_SCHOLARSHIPS];

export function readScholarshipDB(): ScholarshipDatabase {
 let stored: ScrapedScholarship[] = [];
 let storedUpdatedAt: string | null = null;
 if (fs.existsSync(DB_PATH)) {
 try {
 const database = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as ScholarshipDatabase;
 stored = database.scholarships ?? [];
 storedUpdatedAt = database.lastUpdated ?? null;
 } catch {
 stored = [];
 }
 }
 // Merge the built-in layers on every read so all 50 states are always covered
 const storedIds = new Set(stored.map((s) => s.id));
 const merged = [...stored, ...BUILT_IN_SCHOLARSHIPS.filter((s) => !storedIds.has(s.id))];
 return {
 lastUpdated: storedUpdatedAt ?? "1970-01-01T00:00:00.000Z",
 totalCount: merged.length,
 scholarships: merged,
 };
}

export function writeScholarshipDB(scholarships: ScrapedScholarship[]): void {
 const dir = path.dirname(DB_PATH);
 if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

 const db: ScholarshipDatabase = {
 lastUpdated: new Date().toISOString(),
 totalCount: scholarships.length,
 scholarships,
 };
 fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/** Deduplicate by name (case-insensitive), preferring higher-detail entries. */
function deduplicateByName(scholarships: ScrapedScholarship[]): ScrapedScholarship[] {
 const map = new Map<string, ScrapedScholarship>();
 for (const s of scholarships) {
 const key = s.name.toLowerCase().replace(/\s+/g, " ").trim();
 const existing = map.get(key);
 if (!existing) {
 map.set(key, s);
 } else {
 // Keep the one with more detail
 const score = (s: ScrapedScholarship) =>
 (s.description?.length ?? 0) +
 (s.eligibility?.length ?? 0) +
 (s.prompts?.length ?? 0) * 100 +
 (s.amount ? 50 : 0);
 if (score(s) > score(existing)) {
 map.set(key, s);
 }
 }
 }
 return Array.from(map.values());
}

export type ScrapeSource = "all" | "scholarships-com" | "fastweb" | "how2win" | "seed-only";

export async function runScraper(source: ScrapeSource = "all"): Promise<{
 added: number;
 total: number;
 errors: string[];
}> {
 console.log(`\n🎓 Audri Scholarship Scraper, ${new Date().toLocaleString()}`);
 console.log(` Source: ${source}\n`);

 const errors: string[] = [];
 const collected: ScrapedScholarship[] = [];

 // Always start with seed data
 collected.push(...SEED_SCHOLARSHIPS);
 console.log(` 🌱 Seed database: ${SEED_SCHOLARSHIPS.length} scholarships`);

 if (source === "all" || source === "scholarships-com") {
 try {
 const results = await scrapeScholarshipsCom(80);
 collected.push(...results);
 } catch (e) {
 const msg = e instanceof Error ? e.message : String(e);
 errors.push(`scholarships.com: ${msg}`);
 console.error(` ❌ scholarships.com error: ${msg}`);
 }
 }

 if (source === "all" || source === "fastweb") {
 try {
 const results = await scrapeFastweb(120);
 collected.push(...results);
 } catch (e) {
 const msg = e instanceof Error ? e.message : String(e);
 errors.push(`fastweb.com: ${msg}`);
 console.error(` ❌ fastweb.com error: ${msg}`);
 }
 }

 if (source === "all" || source === "how2win") {
 try {
 const results = await scrapeHow2Win(80);
 collected.push(...results);
 } catch (e) {
 const msg = e instanceof Error ? e.message : String(e);
 errors.push(`how2winscholarships.com: ${msg}`);
 console.error(` ❌ how2win error: ${msg}`);
 }
 }

 const deduped = deduplicateByName(collected);
 writeScholarshipDB(deduped);

 console.log(`\n✅ Complete: ${deduped.length} scholarships saved to data/scholarships.json`);
 if (errors.length) console.log(`⚠️ Errors: ${errors.join(", ")}`);

 return { added: deduped.length, total: deduped.length, errors };
}

/** Initialize the database with seed data only (instant, no network requests). */
export function initSeedDB(): void {
 const existing = readScholarshipDB();
 if (existing.totalCount > 0) return; // Already initialized
 const deduped = deduplicateByName(SEED_SCHOLARSHIPS);
 writeScholarshipDB(deduped);
 console.log(` 🌱 Initialized scholarship database with ${deduped.length} seed scholarships.`);
}

/** Search scholarships from the local database. */
export function searchScholarships(params: {
 query?: string;
 categories?: string[];
 minAmount?: number;
 maxAmount?: number;
 source?: string;
 limit?: number;
 offset?: number;
}): { scholarships: ScrapedScholarship[]; total: number } {
 const db = readScholarshipDB();
 let results = db.scholarships;

 if (params.query) {
 const q = params.query.toLowerCase();
 results = results.filter(
 (s) =>
 s.name.toLowerCase().includes(q) ||
 s.description.toLowerCase().includes(q) ||
 s.organization.toLowerCase().includes(q) ||
 s.eligibility.toLowerCase().includes(q) ||
 s.categories.some((c) => c.toLowerCase().includes(q)) ||
 s.tags.some((t) => t.toLowerCase().includes(q))
 );
 }

 if (params.categories?.length) {
 const cats = params.categories.map((c) => c.toLowerCase());
 results = results.filter((s) =>
 s.categories.some((c) => cats.some((q) => c.toLowerCase().includes(q)))
 );
 }

 if (params.minAmount) {
 results = results.filter((s) => !s.amount || s.amount >= params.minAmount!);
 }

 if (params.maxAmount) {
 results = results.filter((s) => !s.amount || s.amount <= params.maxAmount!);
 }

 if (params.source) {
 results = results.filter((s) => s.source === params.source);
 }

 const total = results.length;
 const limit = params.limit ?? 20;
 const offset = params.offset ?? 0;

 return { scholarships: results.slice(offset, offset + limit), total };
}
