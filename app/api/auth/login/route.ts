import { NextRequest, NextResponse } from "next/server";
import { authenticate, getUserProfile, getUserWorkspace } from "@/lib/auth/users";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

/** Email and password sign-in for verified accounts. */
export async function POST(req: NextRequest) {
 try {
 const limited = await enforceRateLimit(`login:${clientAddress(req)}`, 10, 15 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ email?: string; password?: string; remember?: boolean }>(req, 16_384);
 const { email, password, remember } = body;

 if (!email || !password) {
 return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
 }

 const { user, error } = await authenticate(email, password);
 if (error || !user) {
 return NextResponse.json({ error: error ?? "Sign-in failed." }, { status: 401 });
 }

 // The account's saved profile travels with the login, any device, any browser
 const token = user.token;
 const response = NextResponse.json({
  user: { ...user, token: undefined },
  profile: await getUserProfile(email),
  workspace: await getUserWorkspace(email),
 });
 if (token) {
  response.cookies.set("audri_session", token, {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax",
   ...(remember === false ? {} : { maxAge: 60 * 60 * 24 * 30 }),
   path: "/",
  });
 }
 return response;
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Sign-in failed." }, { status: 500 });
 }
}
