import { NextRequest, NextResponse } from "next/server";
import { parseScholarshipWithAI } from "@/lib/scholarships/parseScholarshipWithAI";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
 try {
 const body = await req.json().catch(() => ({}));
 const { text } = body;
 const apiKey = req.headers.get("x-audri-api-key") ?? undefined;

 if (!text?.trim()) {
 return NextResponse.json({ error: "No text provided." }, { status: 400 });
 }
 if (text.trim().length < 50) {
 return NextResponse.json({ error: "Paste more text, we need the full scholarship description." }, { status: 400 });
 }

 const result = await parseScholarshipWithAI(text, apiKey);

 if (!result.title || result.title === "Unknown" || (result.confidenceScore ?? 0) < 20) {
 return NextResponse.json(
 { error: "This doesn't look like a scholarship. Please paste the full text from a scholarship description page." },
 { status: 422 }
 );
 }

 return NextResponse.json(result);
 } catch (err) {
 return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
 }
}
