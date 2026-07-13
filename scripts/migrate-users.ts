import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getAdminDatabase } from "../lib/db/admin";
import type { StoredUser } from "../lib/auth/users";

loadEnvConfig(process.cwd());

async function main() {
 const database = getAdminDatabase();
 if (!database) throw new Error("Supabase service credentials are not configured.");
 const sourcePath = path.join(process.cwd(), "data", "users.json");
 const users = JSON.parse(readFileSync(sourcePath, "utf8")) as StoredUser[];
 for (const user of users) {
  const { error } = await database.from("audri_users").upsert({
   id: user.id,
   email: user.email.toLowerCase(),
   name: user.name,
   password_hash: user.passwordHash,
   plan: user.plan,
   essays_generated: user.essaysGenerated,
   profile_enc: user.profileEnc ?? null,
   workspace_enc: user.workspaceEnc ?? null,
   stripe_customer_id: user.stripeCustomerId ?? null,
   stripe_subscription_id: user.stripeSubscriptionId ?? null,
   subscription_status: user.subscriptionStatus ?? null,
   session_version: user.sessionVersion || 1,
   terms_accepted_at: user.termsAcceptedAt || user.createdAt,
   terms_version: user.termsVersion || "legacy",
   upgraded_at: user.upgradedAt ?? null,
   created_at: user.createdAt,
   updated_at: new Date().toISOString(),
  }, { onConflict: "email" });
  if (error) throw new Error("Could not migrate " + user.email + ": " + error.message);
 }
 console.log("Migrated " + users.length + " customer accounts.");
}

main().catch((error) => {
 console.error(error instanceof Error ? error.message : error);
 process.exitCode = 1;
});

