import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { sendSignupVerificationCode } from "@/lib/auth/emailVerification";
import { hasPendingSignup } from "@/lib/auth/users";

function verificationIdentity(email: string): string {
 return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
 try {
  const body = await readJsonBody<{ email?: string }>(req, 8_192);
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true });

  const limited = await enforceRateLimit(
   `resend-signup:${clientAddress(req)}:${verificationIdentity(email)}`,
   3,
   15 * 60_000
  );
  if (limited) return limited;

  if (await hasPendingSignup(email)) await sendSignupVerificationCode(email);
  return NextResponse.json({ ok: true });
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  console.error("Verification resend failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "A new code could not be sent right now." }, { status: 503 });
 }
}
