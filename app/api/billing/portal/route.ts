import { NextRequest, NextResponse } from "next/server";
import { requireSession, enforceRateLimit } from "@/lib/auth/guards";
import { findUser } from "@/lib/auth/users";
import { getStripe } from "@/lib/billing/stripe";

export async function POST(req: NextRequest) {
 try {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const limited = await enforceRateLimit("billing-portal:" + auth.session.userId, 10, 15 * 60_000);
  if (limited) return limited;

  const user = await findUser(auth.session.email);
  if (!user?.stripeCustomerId) {
   return NextResponse.json({ error: "No billing account exists for this user." }, { status: 409 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const portal = await getStripe().billingPortal.sessions.create({
   customer: user.stripeCustomerId,
   return_url: origin + "/upgrade",
  });
  return NextResponse.json({ url: portal.url });
 } catch (error) {
  console.error("Billing portal failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Could not open billing settings." }, { status: 500 });
 }
}
