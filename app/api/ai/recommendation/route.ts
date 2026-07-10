import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import { enforceHouseStyle } from "@/lib/ai/style";
import { friendlyError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      profile,
      recommenderName,
      recommenderRole,
      relationship,
      duration,
      strengths,
      anecdotes,
      scholarshipName,
      scholarshipFocus,
    } = body;
    const apiKey = req.headers.get("x-audri-api-key") ?? undefined;

    if (!profile) {
      return NextResponse.json({ error: "Build your profile first." }, { status: 400 });
    }
    if (!recommenderRole || !relationship) {
      return NextResponse.json({ error: "Tell us who the recommender is and how they know you." }, { status: 400 });
    }

    const prompt = `Draft a recommendation letter for this student to hand to their recommender as a starting point.

THE RECOMMENDER:
- Name: ${recommenderName || "[Recommender Name]"}
- Role: ${recommenderRole}
- How they know the student: ${relationship}
- For how long: ${duration || "not specified — use a placeholder"}

WHAT THE LETTER IS FOR: ${scholarshipName || "college scholarship applications (general purpose)"}
${scholarshipFocus ? `WHAT THE FUNDER VALUES: ${scholarshipFocus}` : ""}

THE STUDENT:
- Name: ${profile.fullName}
- Education: ${profile.educationLevel ?? "?"} at ${profile.schoolName ?? "?"}${profile.gpa ? `, GPA ${profile.gpa}` : ""}
- Major/direction: ${profile.major ?? profile.intendedMajor ?? "undeclared"}
- Career goal: ${profile.longTermGoals ?? "not specified"}
- Key achievements: ${(profile.achievements ?? []).slice(0, 8).map((a: { title: string; description?: string; impact?: string }) => [a.title, a.description, a.impact].filter(Boolean).join(" — ")).join(" | ") || "see anecdotes below"}

STRENGTHS THE STUDENT WANTS HIGHLIGHTED: ${strengths || "choose the strongest from the material above"}

SPECIFIC MOMENTS THE RECOMMENDER WITNESSED (the raw material — ground every strength in these):
${anecdotes || "None provided — use achievement details and add [placeholder] notes asking the recommender to insert a specific example they remember."}

Write the complete letter now. Standard business letter body (no date/address block needed). Output only the letter text.`;

    const letter = await callAI(prompt, SYSTEM_PROMPTS.RECOMMENDER, { maxTokens: 2048, apiKey });

    return NextResponse.json({ letter: enforceHouseStyle(letter) });
  } catch (err) {
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
