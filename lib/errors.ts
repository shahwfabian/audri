/**
 * Central error handling for Audri.
 * Raw errors, stack traces, and API keys must NEVER reach the user UI.
 */

/** User-facing messages for known error categories. */
const ERROR_MAP: Record<string, string> = {
  // Billing — most common real-world failure
  "credit balance is too low": "Your Anthropic account has no credits. Go to console.anthropic.com/settings/billing to add credits, then try again.",
  "credit balance": "Your Anthropic account needs credits. Visit console.anthropic.com/settings/billing to top up.",
  "billing": "Billing issue on your Anthropic account. Go to console.anthropic.com/settings/billing.",
  "upgrade or purchase": "Your Anthropic account needs credits. Visit console.anthropic.com/settings/billing to add funds.",
  // Key issues
  "ANTHROPIC_API_KEY": "AI features need an API key. Go to Settings to add yours.",
  "API_KEY_MISSING": "AI features need an API key. Go to Settings to add yours.",
  "API key": "AI features need an API key. Go to Settings to add yours.",
  "not configured": "Go to Settings to finish setup.",
  "invalid_api_key": "Your API key is invalid. Double-check it in Settings.",
  "authentication_error": "API key rejected. Check it in Settings → API Key.",
  // Rate limits
  "rate_limit": "Too many requests — Anthropic is rate limiting. Wait a moment and try again.",
  "rate limit": "Too many requests — wait a moment and try again.",
  "overloaded": "Anthropic's servers are busy right now. Try again in a few seconds.",
  // Network
  "fetch failed": "Could not reach the server. Check your internet connection.",
  "network": "Network error — check your connection and try again.",
  "timeout": "The request timed out. Try again in a moment.",
  "ECONNREFUSED": "Could not connect to the server.",
  // HTTP codes
  "401": "Authentication failed. Check your API key in Settings.",
  "403": "Access denied. Check your API key in Settings.",
  "500": "Something went wrong on our end. Please try again.",
  // Database
  "supabase": "Database connection failed. Check Settings → Database.",
  "SUPABASE": "Database connection failed. Check Settings → Database.",
  // Input
  "too short": "Please paste more text — we need the full scholarship description.",
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

/** Parse an API response safely — never throws. */
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
