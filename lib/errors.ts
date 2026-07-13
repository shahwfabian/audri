/**
 * Central error handling for Audri.
 * Raw errors, stack traces, and API keys must NEVER reach the user UI.
 */

/** User-facing messages for known error categories. */
const ERROR_MAP: Record<string, string> = {
 // Provider configuration and billing are operator concerns, never customer setup tasks.
 "credit balance is too low": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "credit balance": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "billing": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "upgrade or purchase": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "ANTHROPIC_API_KEY": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "API_KEY_MISSING": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "API key": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "not configured": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "invalid_api_key": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "authentication_error": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 // Rate limits
 "rate_limit": "Audri is handling high demand. Wait a moment and try again.",
 "rate limit": "Too many requests, wait a moment and try again.",
 "overloaded": "Audri's AI service is busy right now. Try again in a few seconds.",
 // Network
 "fetch failed": "Could not reach the server. Check your internet connection.",
 "network": "Network error, check your connection and try again.",
 "timeout": "The request timed out. Try again in a moment.",
 "ECONNREFUSED": "Could not connect to the server.",
 // HTTP codes
 "401": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "403": "Audri's AI service is temporarily unavailable. Please try again in a few minutes.",
 "500": "Something went wrong on our end. Please try again.",
 // Database
 "supabase": "Audri could not reach its data service. Please try again.",
 "SUPABASE": "Audri could not reach its data service. Please try again.",
 // Input
 "too short": "Please paste more text, we need the full scholarship description.",
 "not a scholarship": "This doesn't look like a scholarship. Paste the full text from a scholarship page.",
};

/**
 * Convert any error into a friendly user-facing message.
 * Never exposes raw error details, stack traces, or secrets.
 */
export function friendlyError(err: unknown): string {
 const raw = err instanceof Error ? err.message : String(err);
 const lower = raw.toLowerCase();

 for (const [key, message] of Object.entries(ERROR_MAP)) {
 if (lower.includes(key.toLowerCase())) return message;
 }

 // Log real error in dev only
 if (process.env.NODE_ENV === "development") {
 console.error("[Audri Error]", raw);
 }

 return "Something went wrong. Please try again.";
}

/**
 * Wrap an async function so it never throws to the caller.
 * Returns { data } on success or { error: string } on failure.
 */
export async function safeAsync<T>(
 fn: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
 try {
 const data = await fn();
 return { data, error: null };
 } catch (err) {
 return { data: null, error: friendlyError(err) };
 }
}

/** Parse an API response safely, never throws. */
export async function safeApiResponse<T>(res: Response): Promise<{
 data: T | null;
 error: string | null;
 status: number;
}> {
 const status = res.status;
 if (res.ok) {
 try {
 const data = (await res.json()) as T;
 return { data, error: null, status };
 } catch {
 return { data: null, error: "Invalid response from server.", status };
 }
 }

 // Don't expose raw server error bodies to UI
 let errorMsg = "Something went wrong. Please try again.";
 try {
 const body = await res.json();
 if (body?.error) errorMsg = friendlyError(body.error);
 } catch {
 errorMsg = friendlyError(`${status}`);
 }

 return { data: null, error: errorMsg, status };
}
