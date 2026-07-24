import { countWords, hasSuspectedTricolon } from "@/lib/ai/style";

export interface EssayEvalFixture {
  id: string;
  prompt: string;
  wordLimit: number;
  studentFacts: string[];
  scholarshipFacts: string[];
  requiredIdeas: string[];
  forbiddenClaims: string[];
  essay: string;
}

export interface EssayEvalResult {
  id: string;
  score: number;
  status: "pass" | "fail";
  wordCount: number;
  gates: Record<string, boolean>;
  missingRequiredIdeas: string[];
  forbiddenClaimsFound: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesIdea(text: string, idea: string): boolean {
  const haystack = normalize(text);
  return normalize(idea)
    .split("|")
    .some((option) => option.trim() && haystack.includes(option.trim()));
}

export function evaluateEssayFixture(fixture: EssayEvalFixture): EssayEvalResult {
  const essay = fixture.essay.trim();
  const wordCount = countWords(essay);
  const missingRequiredIdeas = fixture.requiredIdeas.filter((idea) => !includesIdea(essay, idea));
  const forbiddenClaimsFound = fixture.forbiddenClaims.filter((claim) => includesIdea(essay, claim));

  const gates = {
    withinWordLimit: wordCount <= fixture.wordLimit,
    noDashCharacters: !/[—–―]/.test(essay) && !/\s--+\s/.test(essay),
    noSuspectedTricolon: !hasSuspectedTricolon(essay),
    noForbiddenClaims: forbiddenClaimsFound.length === 0,
    coversRequiredIdeas: missingRequiredIdeas.length === 0,
    referencesStudentFacts: fixture.studentFacts.some((fact) => includesIdea(essay, fact)),
    referencesScholarshipFacts: fixture.scholarshipFacts.some((fact) => includesIdea(essay, fact)),
  };

  const gateScore = Object.values(gates).filter(Boolean).length / Object.values(gates).length;
  const coverageScore =
    fixture.requiredIdeas.length === 0
      ? 1
      : (fixture.requiredIdeas.length - missingRequiredIdeas.length) / fixture.requiredIdeas.length;
  const score = Math.round((gateScore * 70 + coverageScore * 30) * 100) / 100;

  return {
    id: fixture.id,
    score,
    status: Object.values(gates).every(Boolean) ? "pass" : "fail",
    wordCount,
    gates,
    missingRequiredIdeas,
    forbiddenClaimsFound,
  };
}

export function summarizeEssayEval(results: EssayEvalResult[]) {
  const passed = results.filter((result) => result.status === "pass").length;
  const averageScore =
    results.length === 0
      ? 0
      : Math.round((results.reduce((sum, result) => sum + result.score, 0) / results.length) * 100) / 100;

  return {
    fixtures: results.length,
    passed,
    failed: results.length - passed,
    averageScore,
  };
}
