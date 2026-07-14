import { NextResponse } from "next/server";
import { getAdminDatabase } from "@/lib/db/admin";
import { hasServerKey } from "@/lib/ai/client";

export async function GET() {
 const failures: string[] = [];
 if (!hasServerKey() || !process.env.AI_MODEL) failures.push("ai");
 if (!process.env.AUDRI_SECRET || process.env.AUDRI_SECRET.length < 32) failures.push("security");
 if (!process.env.CRON_SECRET) failures.push("scheduler");
 if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_PRO_PRICE_ID) failures.push("billing");

 const database = getAdminDatabase();
 if (!database) {
  failures.push("database");
 } else {
  const { error } = await database.from("audri_users").select("id").limit(1);
  if (error) failures.push("database");
 }

 return NextResponse.json(
  { status: failures.length ? "not-ready" : "ready", failures },
  { status: failures.length ? 503 : 200, headers: { "Cache-Control": "no-store" } }
 );
}
