import { NextRequest, NextResponse } from "next/server";
import { critiqueEssay } from "@/lib/ai/functions/generateEssay";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

export async function POST(req: NextRequest) {
  try {
    const auth = guardAIRequest(req, "critique-essay");
    if (!auth.ok) return auth.response;
    const body = await readJsonBody<{ essay?: string; prompt?: string; wordLimit?: number }>(req, 300_000);
    const { essay, prompt, wordLimit } = body;
    if (!essay || !prompt) {
      return NextResponse.json({ error: "Missing essay or prompt." }, { status: 400 });
    }
    const result = await critiqueEssay(essay, prompt, wordLimit);
    return NextResponse.json(result);
  } catch (err) {
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
