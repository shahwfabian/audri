import { NextRequest, NextResponse } from "next/server";
import { generateEssayStrategy, generateEssayDraft, reviseEssay } from "@/lib/ai/functions/generateEssay";
import { reserveEssay, releaseEssayReservation, FREE_ESSAY_LIMIT } from "@/lib/auth/users";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { friendlyError } from "@/lib/errors";

type GenerationInput = Parameters<typeof generateEssayStrategy>[0];
type GenerateEssayBody = Partial<GenerationInput> & {
 mode?: "revise";
 essay?: string;
 revisionInstructions?: string;
};

export async function POST(req: NextRequest) {
 let reservedFor: string | null = null;
 try {
 const auth = await guardAIRequest(req, "generate-essay", 12);
 if (!auth.ok) return auth.response;
 const body = await readJsonBody<GenerateEssayBody>(req, 500_000);
 const userEmail = auth.session.email;

 if (body.mode === "revise") {
 const { essay, revisionInstructions, wordLimit } = body;
 if (!essay || !revisionInstructions) {
 return NextResponse.json({ error: "Missing essay or instructions." }, { status: 400 });
 }
 const reservation = await reserveEssay(userEmail);
 if (!reservation.allowed) {
 return NextResponse.json(
 { error: `You've used this week's ${FREE_ESSAY_LIMIT} free essays. Upgrade for unlimited essays.`, paywall: true, remaining: 0 },
 { status: 402 }
 );
 }
 reservedFor = userEmail;
 const revised = await reviseEssay(essay, revisionInstructions, wordLimit);
 reservedFor = null;
 return NextResponse.json({ essay: revised, quota: reservation.user ? { plan: reservation.user.plan, remaining: reservation.user.essaysRemaining } : undefined });
 }

 const { profile, prompt, wordLimit, story, allStories, extraNotes, scholarshipName, scholarshipMission } = body;
 if (!profile || !prompt) {
 return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
 }

 const reservation = await reserveEssay(userEmail);
 if (!reservation.allowed) {
 return NextResponse.json(
 { error: `You've used this week's ${FREE_ESSAY_LIMIT} free essays. Upgrade for unlimited essays.`, paywall: true, remaining: 0 },
 { status: 402 }
 );
 }
 reservedFor = userEmail;

 const input = {
 profile,
 prompt,
 wordLimit,
 story,
 allStories,
 extraNotes,
 scholarshipName: scholarshipName ?? "Scholarship Application",
 scholarshipMission,
 };

 const strategy = await generateEssayStrategy(input);
 const essay = await generateEssayDraft(input, strategy);

 reservedFor = null;

 return NextResponse.json({
 essay,
 strategy: strategy.strategy,
 quota: reservation.user ? { plan: reservation.user.plan, remaining: reservation.user.essaysRemaining } : undefined,
 });
 } catch (err) {
 if (reservedFor) await releaseEssayReservation(reservedFor);
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
 }
}
