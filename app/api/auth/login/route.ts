import { NextRequest, NextResponse } from "next/server";
import { authenticate, getUserProfile } from "@/lib/auth/users";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

/** Email + password sign-in. No verification codes, ever. */
export async function POST(req: NextRequest) {
 try {
 const limited = enforceRateLimit(`login:${clientAddress(req)}`, 10, 15 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ email?: string; password?: string }>(req, 16_384);
 const { email, password } = body;

 if (!email || !password) {
 return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
 }

 const { user, error } = authenticate(email, password);
 if (error || !user) {
 return NextResponse.json({ error: error ?? "Sign-in failed." }, { status: 401 });
 }

 // The account's saved profile travels with the login, any device, any browser
 return NextResponse.json({ user, profile: getUserProfile(email) });
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Sign-in failed." }, { status: 500 });
 }
}
