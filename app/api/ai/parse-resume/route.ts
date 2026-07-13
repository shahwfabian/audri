import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/ai/functions/parseResume";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

export async function POST(req: NextRequest) {
  try {
    const auth = await guardAIRequest(req, "parse-resume");
    if (!auth.ok) return auth.response;
    const body = await readJsonBody<{ text?: string }>(req, 300_000);
    const { text } = body;
    if (!text?.trim()) {
      return NextResponse.json({ error: "No resume text provided." }, { status: 400 });
    }
    const result = await parseResume(text);
    return NextResponse.json(result);
  } catch (err) {
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
