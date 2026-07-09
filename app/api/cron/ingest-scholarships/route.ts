// app/api/cron/ingest-scholarships/route.ts
import { NextResponse } from "next/server";
import { scholarshipSources } from "@/lib/scholarships/sources";
import { ingestSource } from "@/lib/scholarships/ingestSource";
import { expireOldScholarships } from "@/lib/scholarships/expireOldScholarships";
import { friendlyError } from "@/lib/errors";

export async function GET(req: Request) {
  // Protect with CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const enabledSources = scholarshipSources.filter((s) => s.enabled);
  const summary: Array<{ source: string; saved: number; success: boolean; error?: string }> = [];

  // Expire old scholarships first
  try {
    const expired = await expireOldScholarships();
    console.log(`[cron] Expired ${expired} past-deadline scholarships.`);
  } catch (err) {
    console.error("[cron] expireOldScholarships error:", err);
  }

  // Ingest each source
  for (const source of enabledSources) {
    try {
      const saved = await ingestSource(source, apiKey);
      summary.push({ source: source.name, saved: saved.length, success: true });
    } catch (err) {
      summary.push({
        source: source.name,
        saved: 0,
        success: false,
        error: friendlyError(err),
      });
    }
  }

  return NextResponse.json({ success: true, summary });
}
