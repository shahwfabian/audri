import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfile } from "@/lib/auth/users";
import { verifySession, bearerFrom } from "@/lib/auth/crypto";

/**
 * Profile sync, STRICTLY per-user.
 *
 * Identity is taken from the signed session token, never from the request body.
 * A student can only ever read or write THEIR OWN profile; passing someone
 * else's email does nothing. The profile is encrypted at rest by the store.
 */
export async function POST(req: NextRequest) {
 const session = verifySession(bearerFrom(req.headers.get("authorization")));
 if (!session) {
 return NextResponse.json({ error: "Not authorized. Please sign in again." }, { status: 401 });
 }

 const body = await req.json().catch(() => ({}));
 const { profile } = body;
 if (!profile) {
 return NextResponse.json({ error: "profile is required" }, { status: 400 });
 }

 const ok = saveUserProfile(session.email, profile);
 if (!ok) return NextResponse.json({ error: "Account not found." }, { status: 404 });
 return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
 const session = verifySession(bearerFrom(req.headers.get("authorization")));
 if (!session) {
 return NextResponse.json({ error: "Not authorized." }, { status: 401 });
 }
 return NextResponse.json({ profile: getUserProfile(session.email) });
}
