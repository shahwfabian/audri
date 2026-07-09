import Anthropic from "@anthropic-ai/sdk";

let _envClient: Anthropic | null = null;

const PLACEHOLDER = "your_anthropic_api_key_here";

/** True when a real key is configured server-side in .env.local */
export function hasServerKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY;
  return !!k && k !== PLACEHOLDER;
}

export function getAnthropicClient(apiKeyOverride?: string): Anthropic {
  if (apiKeyOverride && apiKeyOverride !== PLACEHOLDER) {
    return new Anthropic({ apiKey: apiKeyOverride });
  }
  if (!_envClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === PLACEHOLDER) {
      throw new Error("ANTHROPIC_API_KEY is not configured in .env.local");
    }
    _envClient = new Anthropic({ apiKey });
  }
  return _envClient;
}

/** Model IDs come from the environment (.env.local) so they live outside source control. */
export const AI_MODEL = process.env.AI_MODEL || "";
export const AI_MODEL_FAST = process.env.AI_MODEL_FAST || process.env.AI_MODEL || "";

function requireModel(m: string): string {
  if (!m) throw new Error("AI_MODEL is not configured in .env.local");
  return m;
}

export interface CallOptions {
  maxTokens?: number;
  apiKey?: string;
  temperature?: number;
}

export async function callAI(
  prompt: string,
  systemPrompt: string,
  maxTokensOrOptions: number | CallOptions = 4096
): Promise<string> {
  const opts: CallOptions =
    typeof maxTokensOrOptions === "number" ? { maxTokens: maxTokensOrOptions } : maxTokensOrOptions;

  const client = getAnthropicClient(opts.apiKey);

  const message = await client.messages.create({
    model: requireModel(AI_MODEL),
    max_tokens: opts.maxTokens ?? 4096,
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function callAIJSON<T>(
  prompt: string,
  systemPrompt: string,
  maxTokensOrOptions: number | CallOptions = 4096
): Promise<T> {
  const jsonSystemPrompt = `${systemPrompt}

CRITICAL: Respond with valid JSON only. No markdown fences, no explanation, no preamble. Just the JSON object.`;

  const text = await callAI(prompt, jsonSystemPrompt, maxTokensOrOptions);

  // Strip any accidental markdown fences
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  return JSON.parse(clean) as T;
}
