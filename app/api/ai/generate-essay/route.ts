import { NextRequest, NextResponse } from "next/server";
import { generateEssayStrategy, generateEssayDraft, reviseEssay } from "@/lib/ai/functions/generateEssay";
import { checkEssayQuota, recordEssay, FREE_ESSAY_LIMIT } from "@/lib/auth/users";
import { verifySession, bearerFrom } from "@/lib/auth/crypto";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = req.headers.get("x-audri-api-key") ?? undefined;

    if (body.mode === "revise") {
      const { essay, revisionInstructions, wordLimit } = body;
      if (!essay || !revisionInstructions) {
        return NextResponse.json({ error: "Missing essay or instructions." }, { status: 400 });
      }
      const revised = await reviseEssay(essay, revisionInstructions, wordLimit, apiKey);
      return NextResponse.json({ essay: revised });
    }

    const { profile, prompt, wordLimit, story, allStories, extraNotes, scholarshipName, scholarshipMission } = body;
    if (!profile || !prompt) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Paywall gate — token-authenticated, same quota as the flagship generator
    const session = verifySession(bearerFrom(req.headers.get("authorization")));
    const userEmail: string | undefined = session?.email ?? profile?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Sign in to generate essays." }, { status: 401 });
    }
    const quota = checkEssayQuota(userEmail);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `You've used all ${FREE_ESSAY_LIMIT} free essays. Upgrade to Audri Pro for unlimited essays.`,
          paywall: true,
          plan: quota.plan,
          remaining: 0,
        },
        { status: 402 }
      );
    }

    const input = {
      profile,
      prompt,
      wordLimit,
      story,
      allStories,
      extraNotes,
      scholarshipName: scholarshipName ?? "Scholarship Application",
      scholarshipMission,
      apiKey,
    };

    const strategy = await generateEssayStrategy(input);
    const essay = await generateEssayDraft(input, strategy);

    const updatedUser = recordEssay(userEmail);

    return NextResponse.json({
      essay,
      strategy: strategy.strategy,
      quota: updatedUser ? { plan: updatedUser.plan, remaining: updatedUser.essaysRemaining } : undefined,
    });
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
