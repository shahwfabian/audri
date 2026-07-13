import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

export async function POST(req: NextRequest) {
 const auth = await guardAIRequest(req, "test-key", 6);
 if (!auth.ok) return auth.response;
 try {
 await readJsonBody(req, 4_096);
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 throw err;
 }
 const apiKey = req.headers.get("x-audri-api-key") ?? process.env.ANTHROPIC_API_KEY;

 if (!apiKey || apiKey === "your_anthropic_api_key_here") {
 return NextResponse.json({ error: "No API key provided." }, { status: 400 });
 }

 try {
 const client = new Anthropic({ apiKey });

 await client.messages.create({
 model: process.env.AI_MODEL_FAST || process.env.AI_MODEL || "", // cheapest model, minimal cost for test
 max_tokens: 5,
 messages: [{ role: "user", content: "Hi" }],
 });

 return NextResponse.json({ ok: true });
 } catch (err: unknown) {
 // Parse Anthropic error body for specific user-facing messages
 const raw = err instanceof Error ? err.message : String(err);

 if (raw.includes("credit balance") || raw.includes("upgrade or purchase")) {
 return NextResponse.json(
 {
 error: "Your Anthropic account has no credits.",
 detail: "Your API key is valid, but your account balance is $0. Go to console.anthropic.com/settings/billing to add credits, then everything will work.",
 action: "https://console.anthropic.com/settings/billing",
 keyValid: true,
 },
 { status: 402 }
 );
 }

 if (raw.includes("invalid_api_key") || raw.includes("401") || raw.includes("authentication")) {
 return NextResponse.json(
 { error: "API key is not valid. Double-check that you copied the full key.", keyValid: false },
 { status: 401 }
 );
 }

 if (raw.includes("rate") || raw.includes("overloaded")) {
 return NextResponse.json(
 {
 ok: true,
 warning: "Key looks valid but Anthropic is rate-limiting right now. Saving anyway.",
 keyValid: true,
 },
 { status: 200 }
 );
 }

 return NextResponse.json(
 { error: "Could not verify key. Try saving without testing, it may still work.", detail: "Connection issue" },
 { status: 500 }
 );
 }
}
