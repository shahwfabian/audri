/**
 * URL intelligence for the flagship essay generator.
 *
 * Given a scholarship's URL, this module pulls the scholarship page itself
 * AND researches the funding organization (homepage, about, mission pages)
 * so the essay can be aligned to the funder's mission, the single biggest
 * credibility lever a scholarship essay has.
 */

import { fetchHTML } from "@/lib/scrapers/http";

/** Strip a raw HTML document down to readable text. */
export function htmlToText(html: string, maxChars = 18000): string {
 const text = html
 // kill non-content blocks entirely
 .replace(/<script[\s\S]*?<\/script>/gi, " ")
 .replace(/<style[\s\S]*?<\/style>/gi, " ")
 .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
 .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
 .replace(/<!--[\s\S]*?-->/g, " ")
 // block-level tags become line breaks so structure survives
 .replace(/<\/(p|div|li|h[1-6]|tr|section|article|br)>/gi, "\n")
 .replace(/<br\s*\/?>/gi, "\n")
 // drop every remaining tag
 .replace(/<[^>]+>/g, " ")
 // decode the entities that matter for reading
 .replace(/&nbsp;/g, " ")
 .replace(/&amp;/g, "&")
 .replace(/&lt;/g, "<")
 .replace(/&gt;/g, ">")
 .replace(/&#39;|&apos;/g, "'")
 .replace(/&quot;/g, '"')
 .replace(/&mdash;/g, ", ")
 .replace(/&ndash;/g, ", ")
 // collapse whitespace
 .replace(/[ \t]+/g, " ")
 .replace(/\n{3,}/g, "\n\n")
 .trim();

 return text.slice(0, maxChars);
}

export function isLikelyUrl(s: string): boolean {
 const t = s.trim();
 if (/\s/.test(t)) return false;
 return /^https?:\/\/\S+\.\S+/i.test(t) || /^www\.\S+\.\S+/i.test(t);
}

export function normalizeUrl(s: string): string {
 const t = s.trim();
 return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Fetch the scholarship page itself as readable text. */
export async function fetchScholarshipPage(url: string): Promise<string | null> {
 const html = await fetchHTML(normalizeUrl(url), 20000);
 if (!html) return null;
 const text = htmlToText(html);
 return text.length >= 100 ? text : null;
}

/**
 * Research the organization behind the scholarship: homepage + the first
 * about/mission page that exists. Returns combined readable text (capped),
 * or null if nothing useful was reachable.
 */
export async function fetchFunderBackground(url: string): Promise<string | null> {
 let origin: string;
 try {
 origin = new URL(normalizeUrl(url)).origin;
 } catch {
 return null;
 }

 const chunks: string[] = [];

 const homeHtml = await fetchHTML(origin, 15000);
 if (homeHtml) {
 const home = htmlToText(homeHtml, 6000);
 if (home.length > 200) chunks.push(`[ORGANIZATION HOMEPAGE]\n${home}`);
 }

 const aboutPaths = ["/about", "/about-us", "/mission", "/our-mission", "/who-we-are"];
 for (const p of aboutPaths) {
 const html = await fetchHTML(origin + p, 12000);
 if (html) {
 const text = htmlToText(html, 6000);
 // skip soft-404s that render the homepage or an error shell
 if (text.length > 300) {
 chunks.push(`[ORGANIZATION ${p.toUpperCase()} PAGE]\n${text}`);
 break;
 }
 }
 }

 if (chunks.length === 0) return null;
 return chunks.join("\n\n").slice(0, 12000);
}
