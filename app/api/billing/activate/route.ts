import { NextRequest, NextResponse } from "next/server";
import { upgradeToPro, findUser, toPublic } from "@/lib/auth/users";
import { enforceRateLimit, readJsonBody, requestGuardResponse, requireSession } from "@/lib/auth/guards";

/**
 * Pro activation endpoint.
 *
 * POST { code }, flips the signed-in account to "pro" when the code matches
 * AUDRI_ACTIVATION_SECRET from .env.local. Today you hand students the code
 * after they pay through your Stripe payment link; when you add Stripe
 * webhooks later, the webhook calls this same upgrade path automatically.
 *
 * GET returns the signed-in account's current plan + remaining quota.
 */
export async function POST(req: NextRequest) {
 try {
 const auth = requireSession(req);
 if (!auth.ok) return auth.response;
 const limited = enforceRateLimit(`billing:activate:${auth.session.userId}`, 5, 15 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ code?: string }>(req, 8_192);
 const { code } = body;

 const secret = process.env.AUDRI_ACTIVATION_SECRET;
 if (!secret || secret === "your_activation_secret_here") {
 return NextResponse.json(
 { error: "Activation isn't configured yet, set AUDRI_ACTIVATION_SECRET in .env.local." },
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

 const user = upgradeToPro(auth.session.email);
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
 const auth = requireSession(req);
 if (!auth.ok) return auth.response;
 const u = findUser(auth.session.email);
 if (!u) return NextResponse.json({ error: "No account found." }, { status: 404 });
 return NextResponse.json({ user: toPublic(u) });
}
