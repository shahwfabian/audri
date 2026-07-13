import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null | undefined;

export function getAdminDatabase(): SupabaseClient | null {
 if (adminClient !== undefined) return adminClient;

 const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!url || !serviceRoleKey || url.startsWith("your_")) {
  adminClient = null;
  return null;
 }

 adminClient = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { "X-Client-Info": "audri-server" } },
 });
 return adminClient;
}

export function assertProductionDatabase(): void {
 if (process.env.NODE_ENV === "production" && !getAdminDatabase()) {
  throw new Error("Production database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
 }
}

