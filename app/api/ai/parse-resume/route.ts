import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/ai/functions/parseResume";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body;
    if (!text?.trim()) {
      return NextResponse.json({ error: "No resume text provided." }, { status: 400 });
    }
    const result = await parseResume(text);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
