import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfile } from "@/lib/auth/users";
import { verifySession, bearerFrom } from "@/lib/auth/crypto";
import { readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

/**
 * Profile sync, STRICTLY per-user.
 *
 * Identity is taken from the signed session token, never from the request body.
 * A student can only ever read or write THEIR OWN profile; passing someone
 * else's email does nothing. The profile is encrypted at rest by the store.
 */
export async function POST(req: NextRequest) {
 try {
 const session = verifySession(bearerFrom(req.headers.get("authorization")));
 if (!session) {
 return NextResponse.json({ error: "Not authorized. Please sign in again." }, { status: 401 });
 }

 const body = await readJsonBody<{ profile?: unknown }>(req, 500_000);
 const { profile } = body;
 if (!profile) {
 return NextResponse.json({ error: "profile is required" }, { status: 400 });
 }

 const ok = saveUserProfile(session.email, profile);
 if (!ok) return NextResponse.json({ error: "Account not found." }, { status: 404 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
 }
}

export async function GET(req: NextRequest) {
 const session = verifySession(bearerFrom(req.headers.get("authorization")));
 if (!session) {
 return NextResponse.json({ error: "Not authorized." }, { status: 401 });
 }
 return NextResponse.json({ profile: getUserProfile(session.email) });
}
