import { NextRequest, NextResponse } from "next/server";
import { runGapAnalysis } from "@/lib/ai/functions/gapAnalysis";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile." }, { status: 400 });
    }
    const analysis = await runGapAnalysis(body.profile);
    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
