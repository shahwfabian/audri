import { NextRequest, NextResponse } from "next/server";
import { getAdminDatabase } from "@/lib/db/admin";
import { BUILT_IN_SCHOLARSHIPS, readScholarshipDB, searchScholarships } from "@/lib/scrapers";
import type { ScrapedScholarship } from "@/lib/scrapers/types";

type ScholarshipRow = {
 id: string;
 title: string;
 organization: string | null;
 description: string | null;
 award_amount_min: number | null;
 award_amount_max: number | null;
 deadline: string | null;
 eligibility: Record<string, unknown> | null;
 requirements: Record<string, unknown> | null;
 essay_prompts: Array<{ prompt?: string; wordLimit?: number | null }> | null;
 application_url: string | null;
 source_name: string | null;
 updated_at: string;
};

function stringList(value: unknown): string[] {
 return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapDatabaseScholarship(row: ScholarshipRow): ScrapedScholarship {
 const eligibility = row.eligibility ?? {};
 const requirements = row.requirements ?? {};
 const amount = row.award_amount_max ?? row.award_amount_min ?? undefined;
 const eligibilityParts = Object.values(eligibility).flatMap((value) =>
  Array.isArray(value) ? value.map(String) : value === null || value === undefined ? [] : [String(value)]
 );
 return {
  id: row.id,
  name: row.title,
  organization: row.organization ?? "Unknown",
  amountText: amount ? "$" + Number(amount).toLocaleString() : "Varies",
  amount: amount ? Number(amount) : undefined,
  deadlineText: row.deadline ?? undefined,
  deadline: row.deadline ?? undefined,
  description: row.description ?? "",
  eligibility: eligibilityParts.join(", "),
  applicationUrl: row.application_url ?? undefined,
  source: "seed",
  categories: [...stringList(eligibility.major), ...stringList(eligibility.demographics)],
  tags: [],
  prompts: (row.essay_prompts ?? []).filter((prompt) => prompt.prompt).map((prompt, index) => ({
   id: "p" + index,
   prompt: prompt.prompt!,
   wordLimit: prompt.wordLimit ?? undefined,
   required: true,
  })),
  requirements: {
   resumeRequired: Boolean(requirements.resume),
   transcriptRequired: Boolean(requirements.transcript),
   recommendationLetters: Number(requirements.recommendationLetters ?? 0),
   financialDocuments: false,
   portfolioRequired: Boolean(requirements.portfolio),
   interviewRequired: false,
   otherDocuments: stringList(requirements.other),
  },
  scrapedAt: row.updated_at,
 };
}

function filterScholarships(items: ScrapedScholarship[], params: {
 query?: string;
 categories?: string[];
 minAmount?: number;
 maxAmount?: number;
 source?: string;
 limit: number;
 offset: number;
}) {
 let filtered = items;
 if (params.query) {
  const query = params.query.toLowerCase();
  filtered = filtered.filter((item) => [item.name, item.organization, item.description, item.eligibility, ...item.tags].some((value) => value.toLowerCase().includes(query)));
 }
 if (params.categories?.length) {
  const categories = params.categories.map((category) => category.toLowerCase());
  filtered = filtered.filter((item) => item.categories.some((category) => categories.some((wanted) => category.toLowerCase().includes(wanted))));
 }
 if (params.minAmount) filtered = filtered.filter((item) => !item.amount || item.amount >= params.minAmount!);
 if (params.maxAmount) filtered = filtered.filter((item) => !item.amount || item.amount <= params.maxAmount!);
 if (params.source) filtered = filtered.filter((item) => item.source === params.source);
 return { scholarships: filtered.slice(params.offset, params.offset + params.limit), total: filtered.length };
}

export async function GET(req: NextRequest) {
 const { searchParams } = req.nextUrl;
 const params = {
  query: searchParams.get("q") ?? undefined,
  categories: searchParams.getAll("cat"),
  minAmount: searchParams.get("minAmount") ? Number(searchParams.get("minAmount")) : undefined,
  maxAmount: searchParams.get("maxAmount") ? Number(searchParams.get("maxAmount")) : undefined,
  source: searchParams.get("source") ?? undefined,
  limit: Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24))),
  offset: Math.max(0, Number(searchParams.get("offset") ?? 0)),
 };

 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("scholarships").select("*").eq("status", "active").order("deadline", { ascending: true, nullsFirst: false }).limit(1000);
  if (error) return NextResponse.json({ error: "Could not load scholarships." }, { status: 500 });
  const databaseItems = (data as ScholarshipRow[]).map(mapDatabaseScholarship);
  const knownIds = new Set(databaseItems.map((item) => item.id));
  const merged = [...databaseItems, ...BUILT_IN_SCHOLARSHIPS.filter((item) => !knownIds.has(item.id))];
  const result = filterScholarships(merged, { ...params, categories: params.categories.length ? params.categories : undefined });
  const lastUpdated = databaseItems.reduce((latest, item) => item.scrapedAt > latest ? item.scrapedAt : latest, "1970-01-01T00:00:00.000Z");
  return NextResponse.json({ ...result, lastUpdated, dbTotal: merged.length });
 }

 const result = searchScholarships({ ...params, categories: params.categories.length ? params.categories : undefined });
 const local = readScholarshipDB();
 return NextResponse.json({ ...result, lastUpdated: local.lastUpdated, dbTotal: local.totalCount });
}
