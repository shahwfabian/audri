// app/api/scholarships/search/route.ts
import { NextResponse } from "next/server";
import { friendlyError } from "@/lib/errors";
import { getAdminDatabase } from "@/lib/db/admin";
import { searchScholarships } from "@/lib/scrapers/index";
import { isNoEssayText } from "@/lib/scholarships/quality";

type ScholarshipSearchRow = {
  title?: string | null;
  description?: string | null;
  organization?: string | null;
  eligibility?: Record<string, unknown> | null;
  status?: string | null;
};

function textFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFromUnknown).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textFromUnknown).join(" ");
  return "";
}

function rowText(row: ScholarshipSearchRow): string {
  return [
    row.title,
    row.description,
    row.organization,
    textFromUnknown(row.eligibility),
  ].filter(Boolean).join(" ").toLowerCase();
}

function rowMatches(row: ScholarshipSearchRow, params: {
  query?: string;
  major?: string;
  state?: string;
  category?: string;
}): boolean {
  if (isNoEssayText(row.title, row.description, row.organization, textFromUnknown(row.eligibility))) return false;

  const text = rowText(row);
  if (params.query && !text.includes(params.query.toLowerCase())) return false;
  if (params.major && !text.includes(params.major.toLowerCase())) return false;
  if (params.state && !text.includes(params.state.toLowerCase())) return false;
  if (params.category && !text.includes(params.category.toLowerCase())) return false;
  return true;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? undefined;
    const major = searchParams.get("major") ?? undefined;
    const state = searchParams.get("state") ?? undefined;
    const category = searchParams.get("cat") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    // Use Supabase if configured, otherwise fall back to local JSON
    const supabase = getAdminDatabase();
    if (supabase) {
      const dbQuery = supabase
        .from("scholarships")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("deadline", { ascending: true, nullsFirst: false })
        .limit(1000);

      const { data, error, count } = await dbQuery;
      if (error) throw new Error(error.message);

      const filtered = ((data ?? []) as ScholarshipSearchRow[])
        .filter((row) => rowMatches(row, { query, major, state, category }));

      return NextResponse.json({
        scholarships: filtered.slice(offset, offset + limit),
        total: filtered.length,
        dbTotal: count ?? filtered.length,
      });
    }

    // Fallback: local JSON file
    const cats = category ? [category] : undefined;
    const result = searchScholarships({ query, categories: cats, limit, offset });
    return NextResponse.json({ scholarships: result.scholarships, total: result.total });
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err), scholarships: [], total: 0 }, { status: 500 });
  }
}
