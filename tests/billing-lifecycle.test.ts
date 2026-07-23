import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { unlinkSync } from "node:fs";
import path from "node:path";
import test, { after, before } from "node:test";

const usersFile = `users.billing.${randomUUID()}.json`;
const usersPath = path.join(process.cwd(), "data", usersFile);

process.env.AUDRI_USERS_FILE = usersFile;
process.env.AUDRI_SECRET = "audri-billing-test-secret-with-sufficient-length";
process.env.STRIPE_SECRET_KEY = "sk_test_audri_offline_fixture";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_audri_offline_fixture";
process.env.STRIPE_PRO_PRICE_ID = "price_audri_pro_test";
process.env.NEXT_PUBLIC_APP_URL = "https://audri.example";

let NextRequest: typeof import("next/server").NextRequest;
let stripeModule: typeof import("../lib/billing/stripe");
let usersModule: typeof import("../lib/auth/users");
let checkoutRoute: typeof import("../app/api/billing/checkout/route");
let portalRoute: typeof import("../app/api/billing/portal/route");
let activateRoute: typeof import("../app/api/billing/activate/route");
let webhookRoute: typeof import("../app/api/billing/webhook/route");

before(async () => {
 ({ NextRequest } = await import("next/server"));
 stripeModule = await import("../lib/billing/stripe");
 usersModule = await import("../lib/auth/users");
 checkoutRoute = await import("../app/api/billing/checkout/route");
 portalRoute = await import("../app/api/billing/portal/route");
 activateRoute = await import("../app/api/billing/activate/route");
 webhookRoute = await import("../app/api/billing/webhook/route");
});

after(() => {
 try {
  unlinkSync(usersPath);
 } catch {}
});

function signedRequest(
 payload: string,
 secret = process.env.STRIPE_WEBHOOK_SECRET!
): InstanceType<typeof NextRequest> {
 const signature = stripeModule.getStripe().webhooks.generateTestHeaderString({
  payload,
  secret,
 });
 return new NextRequest("http://localhost/api/billing/webhook", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
   "stripe-signature": signature,
  },
  body: payload,
 });
}

function stripeEvent(type: string, object: Record<string, unknown>) {
 return JSON.stringify({
  id: `evt_${randomUUID()}`,
  object: "event",
  api_version: "2026-02-25.clover",
  created: Math.floor(Date.now() / 1000),
  data: { object },
  livemode: false,
  pending_webhooks: 1,
  request: { id: null, idempotency_key: null },
  type,
 });
}

test("subscription status mapping fails closed", () => {
 assert.equal(stripeModule.subscriptionPlan("active"), "pro");
 assert.equal(stripeModule.subscriptionPlan("trialing"), "pro");
 assert.equal(stripeModule.subscriptionPlan("past_due"), "free");
 assert.equal(stripeModule.subscriptionPlan("unpaid"), "free");
 assert.equal(stripeModule.subscriptionPlan("canceled"), "free");
});

test("checkout uses the authenticated account and configured recurring price", async () => {
 const created = await usersModule.createUser(
  "checkout@example.com",
  "Checkout Student",
  "strong-password",
  true
 );
 assert.ok(created.user?.token);

 const stripe = stripeModule.getStripe();
 let customerInput: Record<string, unknown> | undefined;
 let checkoutInput: Record<string, unknown> | undefined;

 (stripe.customers as unknown as { create: (input: Record<string, unknown>) => Promise<{ id: string }> }).create =
  async (input) => {
   customerInput = input;
   return { id: "cus_checkout_test" };
  };
 (stripe.checkout.sessions as unknown as {
  create: (input: Record<string, unknown>) => Promise<{ url: string }>;
 }).create = async (input) => {
  checkoutInput = input;
  return { url: "https://checkout.stripe.test/session" };
 };

 const response = await checkoutRoute.POST(new NextRequest("http://localhost/api/billing/checkout", {
  method: "POST",
  headers: { Authorization: `Bearer ${created.user.token}` },
 }));
 assert.equal(response.status, 200);
 assert.deepEqual(await response.json(), { url: "https://checkout.stripe.test/session" });
 assert.equal(customerInput?.email, "checkout@example.com");
 assert.equal(customerInput?.name, "Checkout Student");
 assert.equal(checkoutInput?.mode, "subscription");
 assert.equal(checkoutInput?.customer, "cus_checkout_test");
 assert.deepEqual(checkoutInput?.line_items, [{ price: "price_audri_pro_test", quantity: 1 }]);
 assert.equal(checkoutInput?.success_url, "https://audri.example/upgrade?checkout=success");
 assert.equal(checkoutInput?.cancel_url, "https://audri.example/upgrade?checkout=cancelled");

 const stored = await usersModule.findUser("checkout@example.com");
 assert.equal(stored?.stripeCustomerId, "cus_checkout_test");
 assert.equal(stored?.plan, "free");
});

test("signed subscription webhooks upgrade, downgrade, and cancel access", async () => {
 const created = await usersModule.createUser(
  "lifecycle@example.com",
  "Lifecycle Student",
  "strong-password",
  true
 );
 assert.ok(created.user);
 await usersModule.setSubscription(created.user.email, {
  plan: "free",
  customerId: "cus_lifecycle_test",
  status: "incomplete",
 });

 const baseSubscription = {
  id: "sub_lifecycle_test",
  object: "subscription",
  customer: "cus_lifecycle_test",
  metadata: { audri_email: created.user.email },
 };

 const active = stripeEvent("customer.subscription.updated", {
  ...baseSubscription,
  status: "active",
 });
 assert.equal((await webhookRoute.POST(signedRequest(active))).status, 200);
 let stored = await usersModule.findUser(created.user.email);
 assert.equal(stored?.plan, "pro");
 assert.equal(stored?.subscriptionStatus, "active");
 assert.equal(stored?.stripeSubscriptionId, "sub_lifecycle_test");

 const pastDue = stripeEvent("customer.subscription.updated", {
  ...baseSubscription,
  status: "past_due",
 });
 assert.equal((await webhookRoute.POST(signedRequest(pastDue))).status, 200);
 stored = await usersModule.findUser(created.user.email);
 assert.equal(stored?.plan, "free");
 assert.equal(stored?.subscriptionStatus, "past_due");

 const canceled = stripeEvent("customer.subscription.deleted", {
  ...baseSubscription,
  status: "canceled",
 });
 assert.equal((await webhookRoute.POST(signedRequest(canceled))).status, 200);
 assert.equal((await webhookRoute.POST(signedRequest(canceled))).status, 200);
 stored = await usersModule.findUser(created.user.email);
 assert.equal(stored?.plan, "free");
 assert.equal(stored?.subscriptionStatus, "canceled");
});

test("checkout completion retrieves and reconciles the subscription", async () => {
 const created = await usersModule.createUser(
  "completed@example.com",
  "Completed Student",
  "strong-password",
  true
 );
 assert.ok(created.user);
 await usersModule.setSubscription(created.user.email, {
  plan: "free",
  customerId: "cus_completed_test",
  status: "incomplete",
 });

 const stripe = stripeModule.getStripe();
 (stripe.subscriptions as unknown as {
  retrieve: (id: string) => Promise<Record<string, unknown>>;
 }).retrieve = async (id) => ({
  id,
  object: "subscription",
  customer: "cus_completed_test",
  metadata: { audri_email: created.user!.email },
  status: "active",
 });

 const completed = stripeEvent("checkout.session.completed", {
  id: "cs_completed_test",
  object: "checkout.session",
  subscription: "sub_completed_test",
 });
 assert.equal((await webhookRoute.POST(signedRequest(completed))).status, 200);

 const stored = await usersModule.findUser(created.user.email);
 assert.equal(stored?.plan, "pro");
 assert.equal(stored?.subscriptionStatus, "active");
 assert.equal(stored?.stripeSubscriptionId, "sub_completed_test");
});

test("webhooks reject invalid signatures without changing access", async () => {
 const created = await usersModule.createUser(
  "signature@example.com",
  "Signature Student",
  "strong-password",
  true
 );
 assert.ok(created.user);

 const payload = stripeEvent("customer.subscription.updated", {
  id: "sub_signature_test",
  object: "subscription",
  customer: "cus_signature_test",
  metadata: { audri_email: created.user.email },
  status: "active",
 });
 const response = await webhookRoute.POST(new NextRequest("http://localhost/api/billing/webhook", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
   "stripe-signature": "invalid",
  },
  body: payload,
 }));
 assert.equal(response.status, 400);
 assert.equal((await usersModule.findUser(created.user.email))?.plan, "free");
});

test("billing portal uses the stored customer and rejects accounts without one", async () => {
 const withBilling = await usersModule.createUser(
  "portal@example.com",
  "Portal Student",
  "strong-password",
  true
 );
 const withoutBilling = await usersModule.createUser(
  "no-portal@example.com",
  "No Portal Student",
  "strong-password",
  true
 );
 assert.ok(withBilling.user?.token);
 assert.ok(withoutBilling.user?.token);
 await usersModule.setSubscription(withBilling.user.email, {
  plan: "pro",
  customerId: "cus_portal_test",
  subscriptionId: "sub_portal_test",
  status: "active",
 });

 const stripe = stripeModule.getStripe();
 let portalInput: Record<string, unknown> | undefined;
 (stripe.billingPortal.sessions as unknown as {
  create: (input: Record<string, unknown>) => Promise<{ url: string }>;
 }).create = async (input) => {
  portalInput = input;
  return { url: "https://billing.stripe.test/portal" };
 };

 const portalResponse = await portalRoute.POST(new NextRequest("http://localhost/api/billing/portal", {
  method: "POST",
  headers: { Authorization: `Bearer ${withBilling.user.token}` },
 }));
 assert.equal(portalResponse.status, 200);
 assert.deepEqual(await portalResponse.json(), { url: "https://billing.stripe.test/portal" });
 assert.deepEqual(portalInput, {
  customer: "cus_portal_test",
  return_url: "https://audri.example/upgrade",
 });

 const missingResponse = await portalRoute.POST(new NextRequest("http://localhost/api/billing/portal", {
  method: "POST",
  headers: { Authorization: `Bearer ${withoutBilling.user.token}` },
 }));
 assert.equal(missingResponse.status, 409);
});

test("billing status refresh uses the signed account without manual activation", async () => {
 const created = await usersModule.createUser(
  "status-refresh@example.com",
  "Status Refresh",
  "strong-password",
  true
 );
 assert.ok(created.user?.token);
 await usersModule.setSubscription(created.user.email, {
  plan: "pro",
  customerId: "cus_status_refresh_test",
  subscriptionId: "sub_status_refresh_test",
  status: "active",
 });

 const response = await activateRoute.GET(new NextRequest("http://localhost/api/billing/activate", {
  headers: { Authorization: `Bearer ${created.user.token}` },
 }));
 assert.equal(response.status, 200);
 const body = await response.json();
 assert.equal(body.user.plan, "pro");
 assert.equal(body.user.essaysRemaining, null);
});
