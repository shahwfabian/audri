"use server";

import { callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type { StudentProfile, Achievement, AchievementCategory } from "@/lib/types";

interface ParsedResumeResult {
  profile: Partial<StudentProfile>;
  achievements: Achievement[];
  rawStoryHints: string[];
}

export async function parseResume(resumeText: string): Promise<ParsedResumeResult> {
  const prompt = `Parse this student resume and extract all structured information.

RESUME:
${resumeText}

Return a JSON object with:
{
  "profile": {
    "fullName": string,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "schoolName": string | null,
    "graduationYear": number | null,
    "educationLevel": "HIGH_SCHOOL" | "UNDERGRADUATE" | "GRADUATE" | "DOCTORAL" | "TRANSFER" | null,
    "major": string | null,
    "gpa": number | null,
    "testScores": [{"type": string, "score": string}] | [],
    "careerInterests": string[],
    "longTermGoals": string | null,
    "languages": string[],
    "skills": string[],
    "certifications": string[]
  },
  "achievements": [
    {
      "id": "a1",
      "title": string,
      "category": "LEADERSHIP" | "ACADEMICS" | "SERVICE" | "ATHLETICS" | "ARTS" | "WORK" | "RESEARCH" | "ENTREPRENEURSHIP" | "AWARD" | "CERTIFICATION" | "OTHER",
      "organization": string | null,
      "role": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "description": string,
      "impact": string | null,
      "metrics": string[],
      "relatedStories": string[],
      "essayUseCases": string[],
      "isActive": boolean,
      "createdAt": "now"
    }
  ],
  "rawStoryHints": ["brief hint about a potential story found in the resume"]
}`;

  const result = await callAIJSON<ParsedResumeResult>(
    prompt,
    SYSTEM_PROMPTS.RESUME_PARSER
  );

  // Normalize dates
  const now = new Date().toISOString();
  result.achievements = result.achievements.map((a, i) => ({
    ...a,
    id: `ach_${Date.now()}_${i}`,
    createdAt: now,
    metrics: a.metrics ?? [],
    relatedStories: a.relatedStories ?? [],
    essayUseCases: a.essayUseCases ?? [],
    isActive: a.isActive ?? true,
  }));

  return result;
}
