import { NextRequest, NextResponse } from "next/server";
import { requireSession, enforceRateLimit } from "@/lib/auth/guards";
import { findUser, setSubscription } from "@/lib/auth/users";
import { getStripe } from "@/lib/billing/stripe";
import { getBillingPlan, getBillingPriceId } from "@/lib/billing/plans";

export async function POST(req: NextRequest) {
 try {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const limited = await enforceRateLimit("checkout:" + auth.session.userId, 5, 15 * 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({})) as { plan?: string };
  const plan = getBillingPlan(body.plan);
  const priceId = getBillingPriceId(plan);
  if (!priceId) return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });

  const user = await findUser(auth.session.email);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const stripe = getStripe();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
   const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { audri_user_id: user.id, audri_email: user.email },
   });
   customerId = customer.id;
   await setSubscription(user.email, { plan: user.plan, customerId, status: user.subscriptionStatus });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
   mode: plan.checkoutMode,
   customer: customerId,
   line_items: [{ price: priceId, quantity: 1 }],
   client_reference_id: user.id,
   allow_promotion_codes: true,
   success_url: origin + "/upgrade?checkout=success",
   cancel_url: origin + "/upgrade?checkout=cancelled",
   ...(plan.checkoutMode === "subscription"
    ? { subscription_data: { metadata: { audri_user_id: user.id, audri_email: user.email, audri_plan: plan.id } } }
    : {}),
   metadata: { audri_user_id: user.id, audri_email: user.email, audri_plan: plan.id },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return NextResponse.json({ url: session.url });
 } catch (error) {
  console.error("Billing checkout failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
 }
}
