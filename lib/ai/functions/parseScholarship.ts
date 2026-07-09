"use server";

import { callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type { ParsedScholarship } from "@/lib/types";

export async function parseScholarshipDescription(
  text: string
): Promise<ParsedScholarship> {
  const prompt = `Parse this scholarship description and extract all structured information.

SCHOLARSHIP DESCRIPTION:
${text}

Return a JSON object with this exact structure (use null for unknown fields):
{
  "name": string,
  "organization": string,
  "amountText": string,
  "amount": number | null,
  "deadlineText": string | null,
  "deadline": "YYYY-MM-DD" | null,
  "description": string,
  "eligibility": string,
  "eligibilityRules": {
    "minGpa": number | null,
    "maxGpa": number | null,
    "educationLevel": ["HIGH_SCHOOL" | "UNDERGRADUATE" | "GRADUATE" | "DOCTORAL" | "TRANSFER"] | null,
    "majors": string[] | null,
    "states": string[] | null,
    "citizenship": string[] | null,
    "demographics": string[] | null,
    "isFirstGenOnly": boolean | null,
    "isNeedBased": boolean | null,
    "isMeritBased": boolean | null
  },
  "prompts": [
    {
      "id": "p1",
      "prompt": string,
      "wordLimit": number | null,
      "required": boolean
    }
  ],
  "requirements": {
    "resumeRequired": boolean,
    "transcriptRequired": boolean,
    "recommendationLetters": number,
    "financialDocuments": boolean,
    "portfolioRequired": boolean,
    "interviewRequired": boolean,
    "otherDocuments": string[]
  },
  "applicationUrl": string | null,
  "contactEmail": string | null,
  "categories": string[]
}`;

  const result = await callAIJSON<ParsedScholarship>(
    prompt,
    SYSTEM_PROMPTS.SCHOLARSHIP_PARSER
  );

  return result;
}
