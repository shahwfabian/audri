import { NextRequest, NextResponse } from "next/server";
import { runScraper, type ScrapeSource } from "@/lib/scrapers/index";

/**
 * POST /api/scholarships/scrape
 * Triggers a live scrape run. Can be called by:
 *  - The admin panel (manually)
 *  - A Windows Task Scheduler job: curl -X POST http://localhost:3000/api/scholarships/scrape
 *  - A cron service (Vercel Cron, EasyCron, cron-job.org, etc.)
 *
 * Body: { source?: "all" | "fastweb" | "scholarships-com" | "how2win" | "seed-only" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const source: ScrapeSource = body.source ?? "all";

    // Run in background — don't await (can be long-running)
    runScraper(source).then((result) => {
      console.log(`[scrape] Done: ${result.total} scholarships`);
    }).catch((err) => {
      console.error("[scrape] Error:", err);
    });

    return NextResponse.json({
      message: "Scrape started in background.",
      source,
      tip: "Check data/scholarships.json for results.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** GET returns current database stats. */
export async function GET() {
  const { readScholarshipDB } = await import("@/lib/scrapers/index");
  const db = readScholarshipDB();
  return NextResponse.json({
    lastUpdated: db.lastUpdated,
    totalCount: db.totalCount,
    sources: Object.entries(
      db.scholarships.reduce((acc, s) => {
        acc[s.source] = (acc[s.source] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([source, count]) => ({ source, count })),
  });
}
