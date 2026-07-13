import { NextRequest, NextResponse } from "next/server";
import { calculateScholarshipScores } from "@/lib/ai/functions/calculateMatch";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

type MatchBody = {
 profile?: Parameters<typeof calculateScholarshipScores>[0];
 scholarship?: Parameters<typeof calculateScholarshipScores>[1];
};

export async function POST(req: NextRequest) {
  try {
    const auth = guardAIRequest(req, "calculate-match");
    if (!auth.ok) return auth.response;
    const body = await readJsonBody<MatchBody>(req, 400_000);
    if (!body.profile || !body.scholarship) {
      return NextResponse.json({ error: "Missing profile or scholarship." }, { status: 400 });
    }
    const result = await calculateScholarshipScores(body.profile, body.scholarship);
    return NextResponse.json(result);
  } catch (err) {
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
