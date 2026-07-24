import Anthropic from "@anthropic-ai/sdk";
import { recordAIUsage } from "@/lib/ai/usage";

let _envClient: Anthropic | null = null;

const PLACEHOLDER = "your_anthropic_api_key_here";

/** True when a real key is configured server-side in .env.local */
export function hasServerKey(): boolean {
  const k = process.env.ANTHROPIC_API_KEY;
  return !!k && k !== PLACEHOLDER;
}

export function getAnthropicClient(): Anthropic {
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
  temperature?: number;
  route?: string;
  phase?: string;
  userEmail?: string;
  plan?: string;
  model?: "default" | "fast";
}

export async function callAI(
  prompt: string,
  systemPrompt: string,
  maxTokensOrOptions: number | CallOptions = 4096
): Promise<string> {
  const opts: CallOptions =
    typeof maxTokensOrOptions === "number" ? { maxTokens: maxTokensOrOptions } : maxTokensOrOptions;

  const client = getAnthropicClient();

  const model = requireModel(opts.model === "fast" ? AI_MODEL_FAST : AI_MODEL);
  const route = opts.route ?? "unknown";
  const phase = opts.phase ?? "generation";

  try {
  const message = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  await recordAIUsage({
    route,
    phase,
    model,
    userEmail: opts.userEmail,
    plan: opts.plan,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    success: true,
  });
  return content.text;
  } catch (error) {
    await recordAIUsage({
      route,
      phase,
      model,
      userEmail: opts.userEmail,
      plan: opts.plan,
      success: false,
      errorCode: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    });
    throw error;
  }
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
