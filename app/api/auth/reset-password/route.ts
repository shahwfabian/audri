import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { findUser, setPasswordAfterEmailVerification } from "@/lib/auth/users";
import { verifyPasswordResetCode } from "@/lib/auth/emailVerification";

export async function POST(req: NextRequest) {
 try {
  const limited = await enforceRateLimit("password-change:" + clientAddress(req), 8, 60 * 60_000);
  if (limited) return limited;
  const body = await readJsonBody<{ email?: string; code?: string; password?: string }>(req, 16_384);
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^\d{6}$/.test(body.code ?? "") || !body.password || body.password.length < 10) {
   return NextResponse.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
  }
  if (!await findUser(email) || !await verifyPasswordResetCode(email, body.code!)) {
   return NextResponse.json({ error: "This verification code is invalid or expired." }, { status: 400 });
  }
  const changed = await setPasswordAfterEmailVerification(email, body.password);
  if (!changed) return NextResponse.json({ error: "Could not reset the password." }, { status: 400 });
  return NextResponse.json({ ok: true });
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  return NextResponse.json({ error: "Could not reset the password." }, { status: 500 });
 }
}
