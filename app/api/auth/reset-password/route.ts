import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { resetPassword } from "@/lib/auth/users";

export async function POST(req: NextRequest) {
 try {
  const limited = await enforceRateLimit("password-change:" + clientAddress(req), 8, 60 * 60_000);
  if (limited) return limited;
  const body = await readJsonBody<{ token?: string; password?: string }>(req, 16_384);
  if (!body.token || !body.password || body.password.length < 10) {
   return NextResponse.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
  }
  const changed = await resetPassword(body.token, body.password);
  if (!changed) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  return NextResponse.json({ ok: true });
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  return NextResponse.json({ error: "Could not reset the password." }, { status: 500 });
 }
}
