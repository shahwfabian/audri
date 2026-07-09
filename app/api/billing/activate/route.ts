import { NextRequest, NextResponse } from "next/server";
import { upgradeToPro, findUser, toPublic } from "@/lib/auth/users";
import { verifySession, bearerFrom } from "@/lib/auth/crypto";

/**
 * Pro activation endpoint.
 *
 * POST { email, code } — flips the account to "pro" when the code matches
 * AUDRI_ACTIVATION_SECRET from .env.local. Today you hand students the code
 * after they pay through your Stripe payment link; when you add Stripe
 * webhooks later, the webhook calls this same upgrade path automatically.
 *
 * GET ?email= — returns the account's current plan + remaining quota.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, code } = body;

  const secret = process.env.AUDRI_ACTIVATION_SECRET;
  if (!secret || secret === "your_activation_secret_here") {
    return NextResponse.json(
      { error: "Activation isn't configured yet — set AUDRI_ACTIVATION_SECRET in .env.local." },
      { status: 503 }
    );
  }
  // Identity from the signed session — you can only upgrade YOUR OWN account.
  const session = verifySession(bearerFrom(req.headers.get("authorization")));
  const targetEmail = session?.email ?? email;
  if (!targetEmail || !code) {
    return NextResponse.json({ error: "Sign in and enter your activation code." }, { status: 400 });
  }
  if (code !== secret) {
    return NextResponse.json({ error: "Invalid activation code." }, { status: 401 });
  }

  const user = upgradeToPro(targetEmail);
  if (!user) {
    return NextResponse.json({ error: "No account found for that email." }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email query param required" }, { status: 400 });
  const u = findUser(email);
  if (!u) return NextResponse.json({ error: "No account found." }, { status: 404 });
  return NextResponse.json({ user: toPublic(u) });
}
