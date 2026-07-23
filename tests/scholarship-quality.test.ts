import assert from "node:assert/strict";
import test from "node:test";
import { filterSeriousScholarships, isNoEssayScholarship } from "../lib/scholarships/quality";
import type { ScrapedScholarship } from "../lib/scrapers/types";

function scholarship(overrides: Partial<ScrapedScholarship>): ScrapedScholarship {
 return {
  id: "test",
  name: "Community Health Scholars Award",
  organization: "Community Foundation",
  amountText: "$2,000",
  amount: 2000,
  deadlineText: "May 1",
  description: "For students pursuing health careers with service experience.",
  eligibility: "Open to college students with a 3.0 GPA or higher.",
  source: "seed",
  categories: ["Healthcare", "Service"],
  tags: ["healthcare", "service"],
  prompts: [{ id: "p1", prompt: "Describe your service experience.", required: true }],
  requirements: {
   resumeRequired: false,
   transcriptRequired: true,
   recommendationLetters: 1,
   financialDocuments: false,
   portfolioRequired: false,
   interviewRequired: false,
   otherDocuments: [],
  },
  scrapedAt: "2026-07-23T00:00:00.000Z",
  ...overrides,
 };
}

test("no essay and sweepstakes listings are excluded from search quality results", () => {
 const serious = scholarship({});
 const noEssay = scholarship({
  id: "no-essay",
  name: "$10,000 No Essay Scholarship",
  description: "Apply in minutes with no GPA required.",
  categories: ["No Essay"],
  tags: ["no-essay", "easy"],
  prompts: [],
 });
 const sweepstakes = scholarship({
  id: "sweepstakes",
  name: "Monthly College Drawing",
  description: "A scholarship sweepstakes giveaway for all students.",
  tags: ["drawing"],
 });

 assert.equal(isNoEssayScholarship(noEssay), true);
 assert.equal(isNoEssayScholarship(sweepstakes), true);
 assert.deepEqual(filterSeriousScholarships([serious, noEssay, sweepstakes]).map((item) => item.id), ["test"]);
});
