"use server";

import { callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type { StudentProfile, GapAnalysis } from "@/lib/types";

export async function runGapAnalysis(profile: StudentProfile): Promise<GapAnalysis> {
  const achievementCategories = profile.achievements.map((a) => a.category);
  const hasLeadership = achievementCategories.includes("LEADERSHIP");
  const hasService = achievementCategories.includes("SERVICE");
  const hasWork = achievementCategories.includes("WORK");
  const hasResearch = achievementCategories.includes("RESEARCH");
  const hasAwards = achievementCategories.includes("AWARD");

  const prompt = `Analyze this student's scholarship profile and identify gaps that reduce competitiveness.

PROFILE DATA:
- Name: ${profile.fullName}
- Education: ${profile.educationLevel ?? "Not specified"}
- School: ${profile.schoolName ?? "Not specified"}
- GPA: ${profile.gpa ?? "Not provided"}
- Major: ${profile.major ?? profile.intendedMajor ?? "Not declared"}
- Career goals: ${profile.longTermGoals ? "Provided" : "Missing"}
- Financial need: ${profile.financialNeedContext ? "Provided" : "Missing"}
- First gen: ${profile.isFirstGeneration ?? "Not specified"}
- Achievements: ${profile.achievements.length} total
  - Leadership: ${hasLeadership}
  - Service: ${hasService}
  - Work experience: ${hasWork}
  - Research: ${hasResearch}
  - Awards/honors: ${hasAwards}
- Stories in vault: ${profile.stories?.length ?? 0}
- Languages: ${profile.languages.length}
- Skills: ${profile.skills.length}

Return JSON:
{
  "gaps": [
    {
      "id": "gap_1",
      "category": "Leadership | Service | Academics | Documents | Career Clarity | Financial | Story | Resume | Other",
      "title": "Short gap title",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "whyItMatters": "Why this gap hurts scholarship applications",
      "quickFix": "Something the student can do this week",
      "longTermFix": "Something to build over months",
      "actionPlan": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "overallScore": 0-100,
  "categoryScores": {
    "academics": 0-100,
    "leadership": 0-100,
    "service": 0-100,
    "workExperience": 0-100,
    "awards": 0-100,
    "storyDepth": 0-100,
    "careerClarity": 0-100,
    "financialNeedClarity": 0-100,
    "applicationReadiness": 0-100,
    "recommendationReadiness": 0-100
  },
  "topPriorities": ["3 most important things to fix first"]
}`;

  const result = await callAIJSON<Omit<GapAnalysis, "id" | "profileId" | "createdAt">>(
    prompt,
    SYSTEM_PROMPTS.GAP_ANALYZER
  );

  return {
    ...result,
    id: `gap_${Date.now()}`,
    profileId: profile.id,
    createdAt: new Date().toISOString(),
  };
}
