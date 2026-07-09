/**
 * Scraper for How2WinScholarships.com
 * This site is a scholarship strategy guide with curated scholarship lists.
 * Content is more static and accessible than the larger aggregators.
 * ⚠️  Review How2WinScholarships.com ToS before deploying commercially.
 */

import * as cheerio from "cheerio";
import { fetchHTML, politeDelay, cleanText, parseDollarAmount, parseDeadline } from "./http";
import type { ScrapedScholarship } from "./types";

const BASE = "https://www.how2winscholarships.com";

const PAGES = [
  "/scholarships/",
  "/scholarships/high-school-scholarships/",
  "/scholarships/college-scholarships/",
  "/scholarships/stem-scholarships/",
  "/scholarships/community-service-scholarships/",
  "/scholarships/minority-scholarships/",
  "/scholarships/first-generation-college-student-scholarships/",
  "/scholarships/women-scholarships/",
  "/scholarships/no-essay-scholarships/",
  "/scholarships/local-scholarships/",
  "/scholarships/athletic-scholarships/",
  "/scholarships/international-scholarships/",
  "/blog/",
];

function extractFromPage(html: string, pageUrl: string): ScrapedScholarship[] {
  const $ = cheerio.load(html);
  const results: ScrapedScholarship[] = [];

  // How2Win typically has scholarship cards or article sections
  const containers = $(".scholarship-card, .entry, article, .post, .scholarship-item, section");

  containers.each((idx, el) => {
    const name = cleanText(
      $(el).find("h2, h3, h4, .title, .scholarship-title").first().text()
    );
    if (!name || name.length < 5 || name.length > 150) return;
    if (/^(related|see also|tips|how to|about|menu)/i.test(name)) return;

    const body = cleanText($(el).text());

    const amountRaw = body.match(/\$[\d,]+(?:,\d{3})*(?:\.\d+)?/)?.[0] ?? "Varies";
    const amount = parseDollarAmount(amountRaw);

    const orgEl = $(el).find('[class*="org"], [class*="provider"], [class*="sponsor"]').first();
    const org = cleanText(orgEl.text()) || "See application";

    const eligEl = $(el).find('[class*="eligib"], [class*="require"]').first();
    const eligibility = cleanText(eligEl.text()).slice(0, 500) || "See scholarship page for requirements.";

    const deadlineRaw = body.match(/(?:deadline|apply by|due)[:\s]+([\w\s,]+\d{4})/i)?.[1];

    const linkEl = $(el).find("a[href]").first();
    const rawHref = linkEl.attr("href") ?? "";
    const applicationUrl = rawHref.startsWith("http")
      ? rawHref
      : rawHref.startsWith("/")
      ? `${BASE}${rawHref}`
      : pageUrl;

    const desc = cleanText($(el).find("p").first().text()).slice(0, 600)
      || `${name} — scholarship opportunity.`;

    const id = `h2w_${Buffer.from(pageUrl + idx).toString("base64").slice(0, 16)}`;

    results.push({
      id,
      name,
      organization: org,
      amountText: amountRaw,
      amount,
      deadlineText: deadlineRaw,
      deadline: deadlineRaw ? parseDeadline(deadlineRaw) : undefined,
      description: desc,
      eligibility,
      applicationUrl,
      source: "how2winscholarships.com",
      categories: urlToCategories(pageUrl),
      tags: ["curated", "strategy"],
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

  // If no cards found, try heading-based extraction
  if (results.length === 0) {
    $("h2, h3").each((idx, el) => {
      const name = cleanText($(el).text());
      if (!name || name.length < 8 || name.length > 120) return;
      if (/^(how to|tips|guide|about|step|menu|nav)/i.test(name)) return;

      const body = cleanText($(el).nextAll("p").first().text()).slice(0, 500);
      const amountRaw = body.match(/\$[\d,]+/)?.[0] ?? "Varies";
      const id = `h2w_h_${Buffer.from(pageUrl + idx).toString("base64").slice(0, 16)}`;

      results.push({
        id,
        name,
        organization: "See scholarship page",
        amountText: amountRaw,
        amount: parseDollarAmount(amountRaw),
        description: body || name,
        eligibility: "See scholarship page.",
        applicationUrl: pageUrl,
        source: "how2winscholarships.com",
        categories: urlToCategories(pageUrl),
        tags: ["curated"],
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
  }

  return results;
}

function urlToCategories(url: string): string[] {
  const cats: string[] = [];
  if (url.includes("high-school")) cats.push("High School");
  if (url.includes("college")) cats.push("Undergraduate");
  if (url.includes("stem")) cats.push("STEM");
  if (url.includes("community-service")) cats.push("Community Service");
  if (url.includes("minority")) cats.push("Minority");
  if (url.includes("first-generation")) cats.push("First Generation");
  if (url.includes("women")) cats.push("Women");
  if (url.includes("no-essay")) cats.push("No Essay");
  if (url.includes("local")) cats.push("Local");
  if (url.includes("athletic")) cats.push("Athletics");
  if (url.includes("international")) cats.push("International");
  return cats;
}

export async function scrapeHow2Win(maxResults = 80): Promise<ScrapedScholarship[]> {
  console.log("  🏆 Scraping How2WinScholarships.com...");
  const all: ScrapedScholarship[] = [];
  const seen = new Set<string>();

  for (const path of PAGES) {
    if (all.length >= maxResults) break;
    const url = `${BASE}${path}`;
    console.log(`    → ${path}`);

    const html = await fetchHTML(url);
    if (!html) { await politeDelay(); continue; }

    const scholarships = extractFromPage(html, url);
    for (const s of scholarships) {
      if (all.length >= maxResults) break;
      if (!seen.has(s.name)) {
        seen.add(s.name);
        all.push(s);
        console.log(`      ✓ ${s.name.slice(0, 60)}`);
      }
    }
    await politeDelay(2000, 4500);
  }

  console.log(`  ✅ How2WinScholarships.com: ${all.length} scholarships`);
  return all;
}
