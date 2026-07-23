import type { ScrapedScholarship } from "@/lib/scrapers/types";

const NO_ESSAY_PATTERN = /\b(no essay|no-essay|no essays|no gpa|sweepstake|sweepstakes|drawing|giveaway|quick apply|apply in minutes|few clicks|no purchase)\b/i;

export function scholarshipText(scholarship: ScrapedScholarship): string {
 return [
  scholarship.name,
  scholarship.organization,
  scholarship.description,
  scholarship.eligibility,
  scholarship.amountText,
  ...scholarship.categories,
  ...scholarship.tags,
 ].filter(Boolean).join(" ");
}

export function isNoEssayScholarship(scholarship: ScrapedScholarship): boolean {
 return NO_ESSAY_PATTERN.test(scholarshipText(scholarship));
}

export function isSeriousScholarship(scholarship: ScrapedScholarship): boolean {
 return !isNoEssayScholarship(scholarship);
}

export function filterSeriousScholarships(scholarships: ScrapedScholarship[]): ScrapedScholarship[] {
 return scholarships.filter(isSeriousScholarship);
}
