import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { verifySignupCode } from "@/lib/auth/emailVerification";
import { completePendingSignup, hasPendingSignup } from "@/lib/auth/users";

function verificationIdentity(email: string): string {
 return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
 try {
  const body = await readJsonBody<{ email?: string; code?: string }>(req, 8_192);
  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();
  if (!email || !/^\d{6}$/.test(code ?? "")) {
   return NextResponse.json({ error: "Enter the six digit code from your email." }, { status: 400 });
  }

  const limited = await enforceRateLimit(
   `verify-signup:${clientAddress(req)}:${verificationIdentity(email)}`,
   10,
   15 * 60_000
  );
  if (limited) return limited;
  if (!await hasPendingSignup(email)) {
   return NextResponse.json({ error: "Your signup expired. Start again to receive a new code." }, { status: 400 });
  }

  if (!await verifySignupCode(email, code!)) {
   return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
  }

  const { user, error } = await completePendingSignup(email);
  if (error || !user) {
   return NextResponse.json({ error: error ?? "Could not verify this account." }, { status: 400 });
  }

  const token = user.token;
  const response = NextResponse.json({ user: { ...user, token: undefined } });
  if (token) {
   response.cookies.set("audri_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
   });
  }
  return response;
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  console.error("Email verification failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Email verification is temporarily unavailable." }, { status: 503 });
 }
}
