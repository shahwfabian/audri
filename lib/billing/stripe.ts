import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
 const secret = process.env.STRIPE_SECRET_KEY;
 if (!secret) throw new Error("Stripe is not configured.");
 stripeClient ??= new Stripe(secret);
 return stripeClient;
}

export function subscriptionPlan(status: Stripe.Subscription.Status): "free" | "pro" {
 return status === "active" || status === "trialing" ? "pro" : "free";
}

