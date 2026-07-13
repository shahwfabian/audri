import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfile } from "@/lib/auth/users";
import { readJsonBody, requestGuardResponse, requireSession } from "@/lib/auth/guards";

/**
 * Profile sync, STRICTLY per-user.
 *
 * Identity is taken from the signed session token, never from the request body.
 * A student can only ever read or write THEIR OWN profile; passing someone
 * else's email does nothing. The profile is encrypted at rest by the store.
 */
export async function POST(req: NextRequest) {
 try {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;

 const body = await readJsonBody<{ profile?: unknown }>(req, 500_000);
 const { profile } = body;
 if (!profile) {
 return NextResponse.json({ error: "profile is required" }, { status: 400 });
 }

 const ok = await saveUserProfile(auth.session.email, profile);
 if (!ok) return NextResponse.json({ error: "Account not found." }, { status: 404 });
 return NextResponse.json({ ok: true });
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
 }
}

export async function GET(req: NextRequest) {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;
 return NextResponse.json({ profile: await getUserProfile(auth.session.email) });
}
