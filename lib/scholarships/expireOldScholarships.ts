// lib/scholarships/expireOldScholarships.ts

import { getAdminDatabase } from "@/lib/db/admin";

export async function expireOldScholarships(): Promise<number> {
 const supabase = getAdminDatabase();
 if (!supabase) return 0;

  const today = new Date().toISOString().split("T")[0];

  const { error, count } = await supabase
    .from("scholarships")
    .update({ status: "expired" })
    .lt("deadline", today)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
