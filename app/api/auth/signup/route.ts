import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth/users";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

/** Instant account creation, any email provider, no verification code. */
export async function POST(req: NextRequest) {
 try {
 const limited = await enforceRateLimit(`signup:${clientAddress(req)}`, 5, 60 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ email?: string; name?: string; password?: string; acceptedTerms?: boolean }>(req, 16_384);
 const { email, name, password, acceptedTerms } = body;

 if (!email || !name || !password) {
 return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
 }

 const { user, error } = await createUser(email, name, password, acceptedTerms === true);
 if (error || !user) {
 return NextResponse.json({ error: error ?? "Could not create account." }, { status: 400 });
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
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Could not create account." }, { status: 500 });
 }
}
