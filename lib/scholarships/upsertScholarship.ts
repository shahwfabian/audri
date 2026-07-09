// lib/scholarships/upsertScholarship.ts

import { normalizeScholarshipKey } from "./normalizeScholarship";
import type { Scholarship, ScholarshipRow } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function upsertScholarship(
  scholarship: Scholarship
): Promise<ScholarshipRow> {
  const normalizedKey = normalizeScholarshipKey(
    scholarship.title,
    scholarship.organization
  );

  if (!isSupabaseConfigured()) {
    // Fallback: return an in-memory record when DB not configured
    return {
      ...scholarship,
      id: normalizedKey,
      normalized_key: normalizedKey,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScholarshipRow;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholarships")
    .upsert(
      {
        title: scholarship.title,
        organization: scholarship.organization || null,
        description: scholarship.description || null,

        award_amount_min: scholarship.awardAmountMin || null,
        award_amount_max: scholarship.awardAmountMax || null,
        deadline: scholarship.deadline || null,

        eligibility: scholarship.eligibility || {},
        requirements: scholarship.requirements || {},
        essay_prompts: scholarship.essayPrompts || [],

        application_url: scholarship.applicationUrl || null,
        source_name: scholarship.sourceName || null,
        source_url: scholarship.sourceUrl || null,

        confidence_score: scholarship.confidenceScore || 0,
        normalized_key: normalizedKey,

        updated_at: new Date().toISOString(),
      },
      { onConflict: "normalized_key" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ScholarshipRow;
}
