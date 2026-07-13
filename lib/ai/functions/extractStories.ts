"use server";

import { callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type { StudentProfile, Story } from "@/lib/types";

export async function extractStories(profile: StudentProfile): Promise<Story[]> {
  const achievementSummary = profile.achievements
    .map(
      (a) =>
        `- ${a.title} (${a.category}) at ${a.organization ?? "Unknown org"}: ${a.description ?? ""} Impact: ${a.impact ?? "Not specified"}. Metrics: ${a.metrics.join(", ")}`
    )
    .join("\n");

  const prompt = `Extract powerful, authentic stories from this student's profile.

STUDENT PROFILE:
Name: ${profile.fullName}
Education: ${profile.educationLevel}, ${profile.schoolName}
Major: ${profile.major ?? profile.intendedMajor ?? "Undecided"}
Financial need: ${profile.financialNeedContext ?? "Not specified"}
First generation: ${profile.isFirstGeneration ?? "Not specified"}
Career goals: ${profile.longTermGoals ?? "Not specified"}

ACHIEVEMENTS:
${achievementSummary || "None provided yet"}

Extract 3-6 distinct stories from this profile. Each story must be based ONLY on information actually provided above.

Return JSON array:
[
  {
    "id": "story_1",
    "title": string,
    "category": "CHALLENGE" | "LEADERSHIP" | "COMMUNITY_SERVICE" | "FAMILY_RESPONSIBILITY" | "ACADEMIC_GROWTH" | "FAILURE_RECOVERY" | "CULTURAL_TRANSITION" | "FINANCIAL_HARDSHIP" | "FIRST_GENERATION" | "RESEARCH" | "CAREER_DISCOVERY" | "ATHLETIC" | "CREATIVE" | "ENTREPRENEURSHIP" | "MORAL_COURAGE" | "IDENTITY_BELONGING" | "SERVICE" | "MENTORSHIP" | "WORK_ETHIC" | "RESILIENCE",
    "summary": "2-3 sentence summary based on actual profile data",
    "keyFacts": ["fact from profile", "another fact"],
    "emotionalCore": "what makes this emotionally resonant",
    "conflict": "the challenge or tension in this story",
    "turningPoint": "the moment of change or decision",
    "outcome": "what resulted from this experience",
    "lesson": "what the student learned or demonstrated",
    "bestUseCases": ["Leadership scholarship", "Service scholarship"],
    "evidenceRefs": ["achievement id or description that supports this story"],
    "riskNotes": "what details are missing that would make this story stronger",
    "followUpQuestions": ["What specific challenge did you face?", "How many people were impacted?"],
    "createdAt": "now"
  }
]

Only return stories where you have enough real information to make them meaningful. Mark missing details in riskNotes and followUpQuestions.`;

  const stories = await callAIJSON<Story[]>(prompt, SYSTEM_PROMPTS.STORY_EXTRACTOR);

  const now = new Date().toISOString();
  return stories.map((s, i) => ({
    ...s,
    id: `story_${Date.now()}_${i}`,
    createdAt: now,
  }));
}
