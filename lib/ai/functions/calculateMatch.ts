"use server";

import { callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type {
  StudentProfile,
  Scholarship,
  MatchScore,
  ProbabilityScore,
  ROIScore,
} from "@/lib/types";

interface ScoringResult {
  matchScore: MatchScore;
  probabilityScore: ProbabilityScore;
  roiScore: ROIScore;
  eligibilityVerdict: string;
  missingInfo: string[];
  bestStoryIds: string[];
  applicationChecklist: string[];
  recommendedEssayStrategy: string;
  suggestedTimeline: string;
}

export async function calculateScholarshipScores(
  profile: StudentProfile,
  scholarship: Scholarship
): Promise<ScoringResult> {
  const prompt = `Calculate detailed scores for this student-scholarship pairing.

STUDENT PROFILE SUMMARY:
- Education: ${profile.educationLevel}, ${profile.schoolName}, GPA: ${profile.gpa ?? "Not provided"}
- Major: ${profile.major ?? profile.intendedMajor ?? "Not specified"}
- Career interests: ${profile.careerInterests.join(", ") || "None listed"}
- First generation: ${profile.isFirstGeneration ?? "Unknown"}
- Financial need: ${profile.financialNeedContext ? "Yes" : "Not specified"}
- Achievements (${profile.achievements.length}): ${profile.achievements.map((a) => a.title).join("; ")}
- Location: ${profile.location ?? "Unknown"}
- Citizenship: ${profile.citizenship ?? "Unknown"}

SCHOLARSHIP:
Name: ${scholarship.name}
Org: ${scholarship.organization}
Amount: ${scholarship.amountText}
Deadline: ${scholarship.deadlineText ?? "Unknown"}
Eligibility: ${scholarship.eligibility}
Eligibility rules: ${JSON.stringify(scholarship.eligibilityRules)}
Essays required: ${scholarship.prompts.length}
Essay prompts: ${scholarship.prompts.map((p) => p.prompt).join(" | ")}
Requirements: ${JSON.stringify(scholarship.requirements)}

Return JSON:
{
  "matchScore": {
    "total": 0-100,
    "breakdown": {
      "eligibility": 0-100,
      "majorFit": 0-100,
      "gpaFit": 0-100,
      "locationFit": 0-100,
      "gradeLevelFit": 0-100,
      "citizenshipFit": 0-100,
      "demographicFit": 0-100,
      "careerAlignment": 0-100,
      "leadershipAlignment": 0-100,
      "serviceAlignment": 0-100,
      "essayAlignment": 0-100
    },
    "strengths": string[],
    "gaps": string[],
    "eligible": boolean,
    "eligibilityUncertain": boolean
  },
  "probabilityScore": {
    "level": "LOW" | "MODERATE" | "MEDIUM_HIGH" | "HIGH" | "UNKNOWN",
    "confidence": "LOW" | "MODERATE" | "HIGH",
    "reasons": string[],
    "improvements": string[]
  },
  "roiScore": {
    "score": 0-100,
    "estimatedHours": number,
    "amountPerHour": number | null,
    "reasons": string[],
    "recommendation": string
  },
  "eligibilityVerdict": string,
  "missingInfo": string[],
  "bestStoryIds": [],
  "applicationChecklist": string[],
  "recommendedEssayStrategy": string,
  "suggestedTimeline": string
}`;

  return callAIJSON<ScoringResult>(prompt, SYSTEM_PROMPTS.MATCH_SCORER);
}
