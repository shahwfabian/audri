import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { findUser } from "@/lib/auth/users";
import { sendPasswordResetCode } from "@/lib/auth/emailVerification";

export async function POST(req: NextRequest) {
 try {
  const limited = await enforceRateLimit("password-reset:" + clientAddress(req), 5, 60 * 60_000);
  if (limited) return limited;
  const body = await readJsonBody<{ email?: string }>(req, 8_192);
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true });

  if (await findUser(email)) await sendPasswordResetCode(email);
  return NextResponse.json({ ok: true });
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  console.error("Password reset request failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
 }
}
