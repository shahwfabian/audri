import { NextRequest, NextResponse } from "next/server";
import { searchScholarships, readScholarshipDB } from "@/lib/scrapers/index";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const query = searchParams.get("q") ?? undefined;
  const categories = searchParams.getAll("cat");
  const minAmount = searchParams.get("minAmount") ? parseInt(searchParams.get("minAmount")!) : undefined;
  const maxAmount = searchParams.get("maxAmount") ? parseInt(searchParams.get("maxAmount")!) : undefined;
  const source = searchParams.get("source") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "24");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const result = searchScholarships({
    query,
    categories: categories.length ? categories : undefined,
    minAmount,
    maxAmount,
    source,
    limit,
    offset,
  });

  const db = readScholarshipDB();

  return NextResponse.json({
    scholarships: result.scholarships,
    total: result.total,
    lastUpdated: db.lastUpdated,
    dbTotal: db.totalCount,
  });
}
