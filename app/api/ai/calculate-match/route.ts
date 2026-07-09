import { NextRequest, NextResponse } from "next/server";
import { calculateScholarshipScores } from "@/lib/ai/functions/calculateMatch";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.profile || !body.scholarship) {
      return NextResponse.json({ error: "Missing profile or scholarship." }, { status: 400 });
    }
    const result = await calculateScholarshipScores(body.profile, body.scholarship);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
