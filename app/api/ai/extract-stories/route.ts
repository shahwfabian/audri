import { NextRequest, NextResponse } from "next/server";
import { extractStories } from "@/lib/ai/functions/extractStories";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile." }, { status: 400 });
    }
    const stories = await extractStories(body.profile);
    return NextResponse.json(stories);
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
