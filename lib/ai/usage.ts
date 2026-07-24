import { getAdminDatabase } from "@/lib/db/admin";

export type AIUsageEvent = {
 route: string;
 phase: string;
 model: string;
 userEmail?: string;
 plan?: string;
 inputTokens?: number;
 outputTokens?: number;
 success: boolean;
 errorCode?: string;
};

export async function recordAIUsage(event: AIUsageEvent): Promise<void> {
 try {
  const database = getAdminDatabase();
  if (!database) return;
  await database.from("audri_ai_usage").insert({
   route: event.route,
   phase: event.phase,
   model: event.model,
   user_email: event.userEmail?.toLowerCase() ?? null,
   plan: event.plan ?? null,
   input_tokens: event.inputTokens ?? null,
   output_tokens: event.outputTokens ?? null,
   success: event.success,
   error_code: event.errorCode ?? null,
  });
 } catch {
  // Usage telemetry is operationally useful, but it must never break essay generation.
 }
}
