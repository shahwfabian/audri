import { NextRequest, NextResponse } from "next/server";
import { runGapAnalysis } from "@/lib/ai/functions/gapAnalysis";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

type GapAnalysisBody = { profile?: Parameters<typeof runGapAnalysis>[0] };

export async function POST(req: NextRequest) {
  try {
    const auth = guardAIRequest(req, "gap-analysis");
    if (!auth.ok) return auth.response;
    const body = await readJsonBody<GapAnalysisBody>(req, 400_000);
    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile." }, { status: 400 });
    }
    const analysis = await runGapAnalysis(body.profile);
    return NextResponse.json(analysis);
  } catch (err) {
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
