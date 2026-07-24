import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, subscriptionPlan } from "@/lib/billing/stripe";
import { findUserByStripeCustomer, setSubscription } from "@/lib/auth/users";
import { sprintExpiry } from "@/lib/billing/plans";

async function reconcileSubscription(subscription: Stripe.Subscription) {
 const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
 const metadataEmail = subscription.metadata.audri_email;
 const user = metadataEmail ? null : await findUserByStripeCustomer(customerId);
 const email = metadataEmail || user?.email;
 if (!email) throw new Error("No Audri account matches Stripe customer " + customerId + ".");

 await setSubscription(email, {
  plan: subscriptionPlan(subscription.status),
  customerId,
  subscriptionId: subscription.id,
  status: subscription.status,
 });
}

export async function POST(req: NextRequest) {
 const signature = req.headers.get("stripe-signature");
 const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
 if (!signature || !webhookSecret) {
  return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
 }

 let event: Stripe.Event;
 try {
  event = getStripe().webhooks.constructEvent(await req.text(), signature, webhookSecret);
 } catch {
  return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
 }

 try {
  if (
   event.type === "customer.subscription.created" ||
   event.type === "customer.subscription.updated" ||
   event.type === "customer.subscription.deleted"
  ) {
   await reconcileSubscription(event.data.object);
  }

  if (event.type === "checkout.session.completed") {
   const session = event.data.object;
   if (typeof session.subscription === "string") {
    const subscription = await getStripe().subscriptions.retrieve(session.subscription);
    await reconcileSubscription(subscription);
   } else if (session.mode === "payment" && session.payment_status === "paid") {
    const email = session.metadata?.audri_email ?? session.customer_details?.email;
    if (!email) throw new Error("Paid checkout session has no Audri email.");
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    await setSubscription(email, {
     plan: "pro",
     customerId,
     status: "active",
     proExpiresAt: sprintExpiry(),
    });
   }
  }
  return NextResponse.json({ received: true });
 } catch (error) {
  console.error("Stripe webhook reconciliation failed", event.id, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
 }
}
