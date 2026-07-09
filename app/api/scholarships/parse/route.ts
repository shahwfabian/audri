// app/api/scholarships/parse/route.ts
import { NextResponse } from "next/server";
import { parseScholarshipWithAI } from "@/lib/scholarships/parseScholarshipWithAI";
import { upsertScholarship } from "@/lib/scholarships/upsertScholarship";
import { friendlyError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { rawText } = body;

    // Client can pass their API key as a header (from Settings page)
    const apiKeyOverride = req.headers.get("x-audri-api-key") ?? undefined;

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste more text — we need the full scholarship description (at least 50 characters)." },
        { status: 400 }
      );
    }

    const parsedScholarship = await parseScholarshipWithAI(rawText, apiKeyOverride);

    if (!parsedScholarship.title || parsedScholarship.title === "Unknown" || (parsedScholarship.confidenceScore ?? 0) < 20) {
      return NextResponse.json(
        {
          error: "This doesn't look like a scholarship description. Try pasting the full text from the scholarship page — including the name, eligibility requirements, and deadline.",
          confidenceScore: parsedScholarship.confidenceScore ?? 0,
        },
        { status: 422 }
      );
    }

    const savedScholarship = await upsertScholarship(parsedScholarship);

    return NextResponse.json({ success: true, scholarship: savedScholarship });
  } catch (err) {
    // friendlyError converts ALL internal errors to safe user messages
    const message = friendlyError(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
