import { NextRequest, NextResponse } from "next/server";
import { upgradeToPro, findUser, toPublic } from "@/lib/auth/users";
import { enforceRateLimit, readJsonBody, requestGuardResponse, requireSession } from "@/lib/auth/guards";

/**
 * Account billing status and optional support-only activation.
 *
 * Stripe webhooks are the normal source of subscription status. Manual
 * activation is disabled unless support explicitly enables it.
 *
 * GET returns the signed-in account's current plan + remaining quota.
 */
export async function POST(req: NextRequest) {
 try {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;
 if (process.env.AUDRI_ALLOW_MANUAL_ACTIVATION !== "true") {
 return NextResponse.json({ error: "Manual activation is disabled." }, { status: 404 });
 }
 const limited = await enforceRateLimit(`billing:activate:${auth.session.userId}`, 5, 15 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ code?: string }>(req, 8_192);
 const { code } = body;

 const secret = process.env.AUDRI_ACTIVATION_SECRET;
 if (!secret || secret === "your_activation_secret_here") {
 return NextResponse.json(
 { error: "Manual activation is not configured." },
 { status: 503 }
 );
 }
 // Identity from the signed session, you can only upgrade YOUR OWN account.
 if (!code) {
 return NextResponse.json({ error: "Sign in and enter your activation code." }, { status: 400 });
 }
 if (code !== secret) {
 return NextResponse.json({ error: "Invalid activation code." }, { status: 401 });
 }

 const user = await upgradeToPro(auth.session.email);
 if (!user) {
 return NextResponse.json({ error: "No account found for that email." }, { status: 404 });
 }
 return NextResponse.json({ user });
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Activation failed." }, { status: 500 });
 }
}

export async function GET(req: NextRequest) {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;
 const u = await findUser(auth.session.email);
 if (!u) return NextResponse.json({ error: "No account found." }, { status: 404 });
 return NextResponse.json({ user: toPublic(u) });
}
