/**
 * Shared HTTP client for scholarship scrapers.
 * Uses rotating user-agent strings and polite delays to avoid rate-limiting.
 * Always respects robots.txt intent and ToS, use responsibly.
 */

import axios from "axios";
import { assertPublicHttpUrl, UnsafeUrlError } from "./publicUrl";

const USER_AGENTS = [
 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
 "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
 "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
 "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

let uaIndex = 0;
function nextUA(): string {
 return USER_AGENTS[uaIndex++ % USER_AGENTS.length];
}

/** Wait a random polite delay between requests (1.5s, 4s by default). */
export async function politeDelay(minMs = 1500, maxMs = 4000): Promise<void> {
 const ms = minMs + Math.random() * (maxMs - minMs);
 await new Promise((r) => setTimeout(r, ms));
}

/** Fetch a URL and return the raw HTML string. Returns null on any error. */
export async function fetchHTML(url: string, timeoutMs = 15000): Promise<string | null> {
 try {
 const { data } = await axios.get<string>(url, {
 headers: {
 "User-Agent": nextUA(),
 Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
 "Accept-Language": "en-US,en;q=0.5",
 "Accept-Encoding": "gzip, deflate, br",
 Connection: "keep-alive",
 "Upgrade-Insecure-Requests": "1",
 "Cache-Control": "max-age=0",
 },
 timeout: timeoutMs,
 responseType: "text",
 maxRedirects: 5,
 });
 return typeof data === "string" ? data : String(data);
 } catch (err) {
 const msg = err instanceof Error ? err.message : String(err);
 console.warn(` [fetch] ${url} → ${msg}`);
 return null;
 }
}

/** Fetch untrusted user-provided URLs while blocking internal networks and oversized bodies. */
export async function fetchPublicHTML(
 url: string,
 timeoutMs = 15000,
 maxBytes = 2_000_000
): Promise<string | null> {
 let current = url;

 for (let redirect = 0; redirect <= 5; redirect += 1) {
 const safeUrl = await assertPublicHttpUrl(current);
 try {
 const response = await axios.get<string>(safeUrl.toString(), {
 headers: {
 "User-Agent": nextUA(),
 Accept: "text/html,application/xhtml+xml",
 "Accept-Language": "en-US,en;q=0.5",
 },
 timeout: timeoutMs,
 responseType: "text",
 maxRedirects: 0,
 maxContentLength: maxBytes,
 maxBodyLength: maxBytes,
 validateStatus: (status) => status >= 200 && status < 400,
 });

 if (response.status >= 300) {
 const location = response.headers.location;
 if (!location || redirect === 5) return null;
 current = new URL(location, safeUrl).toString();
 continue;
 }

 return typeof response.data === "string" ? response.data : String(response.data);
 } catch (err) {
 if (err instanceof UnsafeUrlError) throw err;
 const msg = err instanceof Error ? err.message : String(err);
 console.warn(` [public fetch] ${safeUrl.origin} -> ${msg}`);
 return null;
 }
 }

 return null;
}

/** Clean whitespace from a scraped string. */
export function cleanText(s: string | null | undefined): string {
 return (s ?? "").replace(/\s+/g, " ").trim();
}

/** Try to parse a dollar amount from a string like "$2,500" or "Up to $10,000". */
export function parseDollarAmount(s: string): number | undefined {
 const match = s.replace(/,/g, "").match(/\$?([\d]+(?:\.\d+)?)/);
 if (!match) return undefined;
 const n = parseFloat(match[1]);
 return isNaN(n) ? undefined : n;
}

/** Try to extract a date string into YYYY-MM-DD. Returns undefined if unparseable. */
export function parseDeadline(s: string): string | undefined {
 if (!s) return undefined;
 const cleaned = s.replace(/\s+/g, " ").trim();
 // Try to find month/day/year pattern
 const patterns = [
 /(\w+ \d{1,2},?\s*\d{4})/, // "March 15, 2026"
 /(\d{1,2}\/\d{1,2}\/\d{4})/, // "3/15/2026"
 /(\d{4}-\d{2}-\d{2})/, // "2026-03-15"
 ];
 for (const p of patterns) {
 const m = cleaned.match(p);
 if (m) {
 const d = new Date(m[1]);
 if (!isNaN(d.getTime())) {
 return d.toISOString().split("T")[0];
 }
 }
 }
 return undefined;
}
