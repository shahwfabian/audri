// lib/scholarships/expireOldScholarships.ts

import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function expireOldScholarships(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { error, count } = await supabase
    .from("scholarships")
    .update({ status: "expired" })
    .lt("deadline", today)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
