import { NextRequest, NextResponse } from "next/server";
import { extractStories } from "@/lib/ai/functions/extractStories";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

type ExtractStoriesBody = { profile?: Parameters<typeof extractStories>[0] };

export async function POST(req: NextRequest) {
  try {
    const auth = guardAIRequest(req, "extract-stories");
    if (!auth.ok) return auth.response;
    const body = await readJsonBody<ExtractStoriesBody>(req, 400_000);
    if (!body.profile) {
      return NextResponse.json({ error: "Missing profile." }, { status: 400 });
    }
    const stories = await extractStories(body.profile);
    return NextResponse.json(stories);
  } catch (err) {
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
