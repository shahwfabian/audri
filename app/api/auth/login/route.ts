import { NextRequest, NextResponse } from "next/server";
import { authenticate, getUserProfile } from "@/lib/auth/users";

/** Email + password sign-in. No verification codes, ever. */
export async function POST(req: NextRequest) {
 const body = await req.json().catch(() => ({}));
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
}
