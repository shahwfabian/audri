// lib/scholarships/parseScholarshipWithAI.ts

import Anthropic from "@anthropic-ai/sdk";
import type { Scholarship } from "./types";

function getClient(apiKeyOverride?: string): Anthropic {
  const apiKey =
    apiKeyOverride ??
    process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("API_KEY_MISSING");
  }

  return new Anthropic({ apiKey });
}

export async function parseScholarshipWithAI(
  rawText: string,
  apiKeyOverride?: string
): Promise<Scholarship> {
  const anthropic = getClient(apiKeyOverride);

  const response = await anthropic.messages.create({
    model: process.env.AI_MODEL || "",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `
Extract scholarship information from the text below.

Return ONLY valid JSON. No markdown fences, no explanation.

Rules:
- Do not invent missing details.
- Use null when unknown.
- Use arrays when multiple values exist.
- Extract deadlines in YYYY-MM-DD format if possible.
- Extract award amount as numeric values if possible.
- Set confidenceScore from 0 to 100 (how confident you are this is a real scholarship).
- If the text does not appear to be a scholarship description, set confidenceScore to 0 and title to "Unknown".

JSON format:
{
  "title": "",
  "organization": "",
  "description": "",
  "awardAmountMin": null,
  "awardAmountMax": null,
  "deadline": null,
  "eligibility": {
    "gpa": null,
    "gradeLevel": [],
    "major": [],
    "citizenship": null,
    "state": [],
    "demographics": [],
    "financialNeed": null,
    "other": []
  },
  "requirements": {
    "resume": false,
    "transcript": false,
    "recommendationLetters": 0,
    "essays": false,
    "portfolio": false,
    "other": []
  },
  "essayPrompts": [
    {
      "prompt": "",
      "wordLimit": null
    }
  ],
  "applicationUrl": null,
  "sourceName": null,
  "sourceUrl": null,
  "confidenceScore": 0
}

Scholarship text:
${rawText}
        `.trim(),
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(clean) as Scholarship;
}
