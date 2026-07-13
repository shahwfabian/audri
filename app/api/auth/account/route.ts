import { NextRequest, NextResponse } from "next/server";
import { requireSession, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { deleteUser, exportUserData, findUser, verifyAccountPassword } from "@/lib/auth/users";
import { getStripe } from "@/lib/billing/stripe";

export async function GET(req: NextRequest) {
 try {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const data = await exportUserData(auth.session.email);
  if (!data) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ exportedAt: new Date().toISOString(), ...data });
 } catch {
  return NextResponse.json({ error: "Could not export account data." }, { status: 500 });
 }
}

export async function DELETE(req: NextRequest) {
 try {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const body = await readJsonBody<{ password?: string; confirmation?: string }>(req, 16_384);
  if (body.confirmation !== "DELETE" || !body.password) {
   return NextResponse.json({ error: "Password and DELETE confirmation are required." }, { status: 400 });
  }
  if (!(await verifyAccountPassword(auth.session.email, body.password))) {
   return NextResponse.json({ error: "Password is incorrect." }, { status: 401 });
  }

  const user = await findUser(auth.session.email);
  if (user?.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
   await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
  }
  const deleted = await deleteUser(auth.session.email);
  if (!deleted) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
 } catch (error) {
  const guarded = requestGuardResponse(error);
  if (guarded) return guarded;
  console.error("Account deletion failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Could not delete the account." }, { status: 500 });
 }
}
