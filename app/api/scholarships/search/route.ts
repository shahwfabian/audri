// app/api/scholarships/search/route.ts
import { NextResponse } from "next/server";
import { friendlyError } from "@/lib/errors";
import { getAdminDatabase } from "@/lib/db/admin";
import { searchScholarships } from "@/lib/scrapers/index";

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

      let dbQuery = supabase
        .from("scholarships")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("deadline", { ascending: true, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (query) {
        dbQuery = dbQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,organization.ilike.%${query}%`
        );
      }
      if (major) {
        dbQuery = dbQuery.contains("eligibility", { major: [major] });
      }
      if (state) {
        dbQuery = dbQuery.contains("eligibility", { state: [state] });
      }

      const { data, error, count } = await dbQuery;
      if (error) throw new Error(error.message);

      return NextResponse.json({ scholarships: data ?? [], total: count ?? 0 });
    }

    // Fallback: local JSON file
    const cats = category ? [category] : undefined;
    const result = searchScholarships({ query, categories: cats, limit, offset });
    return NextResponse.json({ scholarships: result.scholarships, total: result.total });
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err), scholarships: [], total: 0 }, { status: 500 });
  }
}
