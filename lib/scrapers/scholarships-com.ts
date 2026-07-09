/**
 * Scraper for Scholarships.com public scholarship listings.
 * Scrapes the publicly visible search results pages.
 * ⚠️  Review Scholarships.com ToS before deploying commercially.
 */

import * as cheerio from "cheerio";
import { fetchHTML, politeDelay, cleanText, parseDollarAmount, parseDeadline } from "./http";
import type { ScrapedScholarship } from "./types";

const BASE = "https://www.scholarships.com";

/** Category search pages that are publicly accessible without login. */
const CATEGORY_PAGES = [
  "/financial-aid/college-scholarships/scholarships-by-type/merit-scholarships/",
  "/financial-aid/college-scholarships/scholarships-by-type/need-based-scholarships/",
  "/financial-aid/college-scholarships/scholarships-by-major/",
  "/financial-aid/college-scholarships/scholarships-by-state/",
  "/financial-aid/college-scholarships/minority-scholarships/",
  "/financial-aid/college-scholarships/scholarships-for-women/",
  "/financial-aid/college-scholarships/first-generation-scholarships/",
  "/financial-aid/college-scholarships/graduate-school-scholarships/",
  "/financial-aid/college-scholarships/no-essay-scholarships/",
];

function parseScholarshipPage(html: string, url: string): Partial<ScrapedScholarship> | null {
  const $ = cheerio.load(html);

  const name = cleanText(
    $("h1").first().text() ||
    $(".scholarship-name, .award-title, title").first().text()
  );
  if (!name || name.length < 4) return null;

  // Try several selectors for amount
  const amountRaw = cleanText(
    $('[class*="award"], [class*="amount"], [class*="value"]').first().text() ||
    $("dt:contains('Award'), dt:contains('Amount')").next("dd").first().text()
  );

  // Try deadline
  const deadlineRaw = cleanText(
    $('[class*="deadline"], [class*="due"]').first().text() ||
    $("dt:contains('Deadline'), dt:contains('Due Date')").next("dd").first().text()
  );

  // Description
  const description = cleanText(
    $('[class*="description"], [class*="overview"], .scholarship-description, #overview').first().text() ||
    $("article p").first().text()
  ).slice(0, 800);

  // Eligibility
  const eligibility = cleanText(
    $('[class*="eligib"], [class*="requirement"], #eligibility').first().text()
  ).slice(0, 600);

  const amount = parseDollarAmount(amountRaw);
  const deadline = parseDeadline(deadlineRaw);

  return {
    name,
    organization: cleanText($('[class*="sponsor"], [class*="provider"], [class*="funder"]').first().text()) || "Scholarships.com",
    amountText: amountRaw || (amount ? `$${amount.toLocaleString()}` : "Varies"),
    amount,
    deadlineText: deadlineRaw || undefined,
    deadline,
    description: description || `${name} — see application for full details.`,
    eligibility: eligibility || "See scholarship page for eligibility requirements.",
    applicationUrl: url,
    source: "scholarships.com" as const,
    categories: [],
    tags: [],
  };
}

async function scrapeListingPage(path: string): Promise<string[]> {
  const html = await fetchHTML(`${BASE}${path}`);
  if (!html) return [];

  const $ = cheerio.load(html);
  const links: string[] = [];

  // Collect scholarship detail links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (
      href.includes("/scholarship/") ||
      href.includes("/award/") ||
      (href.startsWith("/financial-aid") && href.includes("-scholarship"))
    ) {
      const full = href.startsWith("http") ? href : `${BASE}${href}`;
      if (!links.includes(full)) links.push(full);
    }
  });

  return links.slice(0, 20); // polite limit per page
}

export async function scrapeScholarshipsCom(maxResults = 80): Promise<ScrapedScholarship[]> {
  console.log("  📚 Scraping Scholarships.com...");
  const results: ScrapedScholarship[] = [];
  const seen = new Set<string>();

  for (const page of CATEGORY_PAGES) {
    if (results.length >= maxResults) break;

    console.log(`    → category: ${page}`);
    const links = await scrapeListingPage(page);
    await politeDelay();

    for (const url of links) {
      if (results.length >= maxResults) break;
      if (seen.has(url)) continue;
      seen.add(url);

      const html = await fetchHTML(url);
      if (!html) { await politeDelay(500, 1200); continue; }

      const parsed = parseScholarshipPage(html, url);
      if (parsed?.name) {
        results.push(toFull(parsed, url));
        console.log(`      ✓ ${parsed.name.slice(0, 60)}`);
      }
      await politeDelay();
    }
  }

  console.log(`  ✅ Scholarships.com: ${results.length} scholarships`);
  return results;
}

function toFull(p: Partial<ScrapedScholarship>, url: string): ScrapedScholarship {
  return {
    id: `sc_${Buffer.from(url).toString("base64").slice(0, 16)}`,
    name: p.name ?? "Unknown Scholarship",
    organization: p.organization ?? "Unknown",
    amountText: p.amountText ?? "Varies",
    amount: p.amount,
    deadlineText: p.deadlineText,
    deadline: p.deadline,
    description: p.description ?? "",
    eligibility: p.eligibility ?? "",
    applicationUrl: url,
    source: "scholarships.com",
    categories: p.categories ?? [],
    tags: p.tags ?? [],
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
  };
}
