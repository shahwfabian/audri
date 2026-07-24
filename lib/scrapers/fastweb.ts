/**
 * Scraper for Fastweb.com public scholarship content.
 * Targets article/listing pages accessible without login.
 * ⚠️ Review Fastweb.com ToS before deploying commercially.
 */

import * as cheerio from "cheerio";
import { fetchHTML, politeDelay, cleanText, parseDollarAmount, parseDeadline } from "./http";
import type { ScrapedScholarship } from "./types";

const BASE = "https://www.fastweb.com";

const LISTING_PAGES = [
 "/college-scholarships/articles/scholarships-for-college-students",
 "/college-scholarships/articles/july-scholarship-opportunities",
 "/college-scholarships/articles/full-tuition-scholarships",
 "/college-scholarships/articles/biggest-scholarships-in-america",
 "/college-scholarships/articles/scholarships-for-high-school-seniors",
 "/college-scholarships/articles/scholarships-for-first-generation-college-students",
 "/college-scholarships/articles/scholarships-for-women",
 "/college-scholarships/articles/scholarships-for-minorities",
 "/college-scholarships/articles/stem-scholarships",
 "/college-scholarships/articles/community-service-scholarships",
 "/college-scholarships/articles/no-essay-scholarships",
 "/college-scholarships/articles/graduate-school-scholarships",
 "/college-scholarships/articles/need-based-scholarships",
 "/college-scholarships/articles/scholarships-for-transfer-students",
 "/college-scholarships/articles/athletic-scholarships",
 "/college-scholarships/articles/art-scholarships",
 "/college-scholarships/articles/nursing-scholarships",
 "/college-scholarships/articles/business-scholarships",
];

function extractScholarshipsFromArticle(html: string, pageUrl: string): ScrapedScholarship[] {
 const $ = cheerio.load(html);
 const results: ScrapedScholarship[] = [];

 // Fastweb articles list scholarships inside list items / sections
 let articleText = $("article, .article-content, .post-content, main").first();
 if (articleText.length === 0 || cleanText(articleText.text()).length < 200) {
  articleText = $("body");
 }

 // Try structured list items
 const items = articleText.find("h2, h3, h4, li strong, .scholarship-name").toArray();

 items.forEach((el, idx) => {
 const heading = cleanText($(el).text());
 if (!heading || heading.length < 5 || heading.length > 120) return;
 if (/^(see also|related|more|click|read|apply|learn|what's trending|scholarships for|scholarship questions|next step|you might also like|popular|latest|trending)$/i.test(heading)) return;
 if (/^(how|top|unique|why|applied for|in her|video scholarships|july|college scholarships|scholarships for|full-tuition scholarships|the ultimate list|x fastweb)/i.test(heading)) return;
 if (/^\d{4}\s+.*scholarships/i.test(heading) || /^\d+\+?\s+best\s+.*scholarships/i.test(heading)) return;
 if (!/(scholarship|scholars|award|grant|fellowship|tuition|program|fund)/i.test(heading)) return;

 // Try to find adjacent amount and description
 const next = $(el).nextAll("p, li, div").first();
 const context = cleanText(next.text()).slice(0, 500);

 const amountRaw = context.match(/\$[\d,]+(?:\.\d+)?/)?.[0] ?? "Varies";
 const amount = parseDollarAmount(amountRaw);

 const deadlineRaw = context.match(
 /(?:deadline|due)[:\s]+([\w\s,]+\d{4})/i
 )?.[1];

 const id = `fw_${Buffer.from(pageUrl + idx).toString("base64").slice(0, 16)}`;

 results.push({
 id,
 name: heading,
 organization: heading, // best guess without deeper scrape
 amountText: amountRaw,
 amount,
 deadlineText: deadlineRaw,
 deadline: deadlineRaw ? parseDeadline(deadlineRaw) : undefined,
 description: context || `${heading}, see Fastweb for full details.`,
 eligibility: "See scholarship page for eligibility requirements.",
 applicationUrl: pageUrl,
 source: "fastweb.com",
 categories: urlToCategories(pageUrl),
 tags: [],
 prompts: [],
 requirements: {
 resumeRequired: false,
 transcriptRequired: false,
 recommendationLetters: 0,
 financialDocuments: false,
 portfolioRequired: false,
 interviewRequired: false,
 otherDocuments: [],
 },
 scrapedAt: new Date().toISOString(),
 });
 });

 return results;
}

function urlToCategories(url: string): string[] {
 const cats: string[] = [];
 if (url.includes("women")) cats.push("Women");
 if (url.includes("minorities") || url.includes("minority")) cats.push("Minority");
 if (url.includes("stem")) cats.push("STEM");
 if (url.includes("first-generation")) cats.push("First Generation");
 if (url.includes("community-service")) cats.push("Community Service");
 if (url.includes("no-essay")) cats.push("No Essay");
 if (url.includes("graduate")) cats.push("Graduate");
 if (url.includes("need-based")) cats.push("Need-Based");
 if (url.includes("transfer")) cats.push("Transfer");
 if (url.includes("athletic") || url.includes("sport")) cats.push("Athletics");
 if (url.includes("art-scholarships")) cats.push("Arts");
 if (url.includes("nursing") || url.includes("health")) cats.push("Healthcare");
 if (url.includes("business")) cats.push("Business");
 return cats;
}

export async function scrapeFastweb(maxResults = 120): Promise<ScrapedScholarship[]> {
 console.log(" ⚡ Scraping Fastweb.com...");
 const all: ScrapedScholarship[] = [];
 const seen = new Set<string>();

 for (const path of LISTING_PAGES) {
 if (all.length >= maxResults) break;

 const url = `${BASE}${path}`;
 console.log(` → ${path}`);
 const html = await fetchHTML(url);
 if (!html) { await politeDelay(); continue; }

 const scholarships = extractScholarshipsFromArticle(html, url);
 for (const s of scholarships) {
 if (all.length >= maxResults) break;
 if (!seen.has(s.name)) {
 seen.add(s.name);
 all.push(s);
 console.log(` ✓ ${s.name.slice(0, 60)}`);
 }
 }
 await politeDelay(2000, 5000);
 }

 console.log(` ✅ Fastweb.com: ${all.length} scholarships`);
 return all;
}
