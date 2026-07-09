import { NextRequest, NextResponse } from "next/server";
import { critiqueEssay } from "@/lib/ai/functions/generateEssay";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { essay, prompt, wordLimit } = body;
    if (!essay || !prompt) {
      return NextResponse.json({ error: "Missing essay or prompt." }, { status: 400 });
    }
    const result = await critiqueEssay(essay, prompt, wordLimit);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
