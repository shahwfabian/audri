import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createUser, stagePendingSignup } from "@/lib/auth/users";
import { sendSignupVerificationCode } from "@/lib/auth/emailVerification";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { getAdminDatabase } from "@/lib/db/admin";

/** Creates a pending account and verifies email ownership before issuing a session. */
export async function POST(req: NextRequest) {
 try {
 const address = clientAddress(req);
 const addressLimited = await enforceRateLimit(`signup-ip:${address}`, 20, 60 * 60_000);
 if (addressLimited) return addressLimited;
 const body = await readJsonBody<{ email?: string; name?: string; password?: string; acceptedTerms?: boolean }>(req, 16_384);
 const { email, name, password, acceptedTerms } = body;

 if (!email || !name || !password) {
 return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
 }

 const normalizedEmail = email.trim().toLowerCase();
 const emailHash = createHash("sha256").update(normalizedEmail).digest("hex").slice(0, 24);
 const emailLimited = await enforceRateLimit(`signup-email:${emailHash}`, 5, 60 * 60_000);
 if (emailLimited) return emailLimited;

 if (getAdminDatabase() && process.env.AUDRI_REQUIRE_EMAIL_VERIFICATION === "true") {
  const staged = await stagePendingSignup(normalizedEmail, name, password, acceptedTerms === true);
  if (staged.error || !staged.email) {
   return NextResponse.json({ error: staged.error ?? "Could not create account." }, { status: 400 });
  }
  await sendSignupVerificationCode(staged.email);
  return NextResponse.json({ verificationRequired: true, email: staged.email }, { status: 202 });
 }

 const { user, error } = await createUser(normalizedEmail, name, password, acceptedTerms === true);
 if (error || !user) return NextResponse.json({ error: error ?? "Could not create account." }, { status: 400 });

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
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 console.error("Signup failed", err instanceof Error ? err.message : err);
 return NextResponse.json({ error: "Account creation is temporarily unavailable." }, { status: 503 });
 }
}
