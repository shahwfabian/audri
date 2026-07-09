"use server";

import { callAI, callAIJSON } from "@/lib/ai/client";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts/system";
import type { StudentProfile, Story, EssayScores, EssayFeedback } from "@/lib/types";

interface EssayGenerationInput {
  profile: StudentProfile;
  prompt: string;
  wordLimit?: number;
  story?: Story;
  /** All stories in the vault — the strategist picks the strongest for this prompt */
  allStories?: Story[];
  scholarshipName: string;
  scholarshipMission?: string;
  /** Researched intelligence about the funding organization (mission, values, what they reward) */
  funderIntelligence?: string;
  /** Anything extra the student typed for THIS scholarship — context, memories, details */
  extraNotes?: string;
  /** Selected voice/tone directive from the 1,440-voice library */
  toneDirective?: string;
  apiKey?: string;
}

interface EssayStrategyResult {
  strategy: string;
  selectedStoryTitle: string;
  centralScene: string;
  whyChain: string[];
  keyThemes: string[];
  openingHook: string;
  growthArc: string;
  structureOutline: string[];
  warningsToAvoid: string[];
  oneSentencePoint: string;
  endingStyle:
    | "quiet-future"
    | "return-to-opening-image"
    | "unanswered-next-step"
    | "small-image-large-meaning"
    | "future-without-bragging";
  closingLineDirection: string;
  missionAlignment: string;
  payItForward: string;
}

function buildStudentDossier(input: EssayGenerationInput): string {
  const p = input.profile;

  const achievements = p.achievements
    .slice(0, 12)
    .map((a) => {
      const bits = [a.title, a.role, a.organization, a.description, a.impact, ...(a.metrics ?? [])].filter(Boolean);
      return `- ${bits.join(" | ")}`;
    })
    .join("\n");

  const storyBlock = (s: Story) =>
    `STORY: ${s.title}
  Summary: ${s.summary}
  Key facts: ${(s.keyFacts ?? []).join("; ")}
  Emotional core: ${s.emotionalCore}
  Conflict: ${s.conflict}
  Turning point: ${s.turningPoint}
  Outcome: ${s.outcome}
  Lesson: ${s.lesson}`;

  const stories = input.story
    ? `SELECTED STORY (the student chose this — center the essay on it):\n${storyBlock(input.story)}`
    : input.allStories?.length
      ? `STORY VAULT (choose the ONE story that best answers this prompt):\n${input.allStories.slice(0, 8).map(storyBlock).join("\n\n")}`
      : "No stories in the vault yet — build the essay from the achievements and notes below, and flag which details are too thin.";

  return `Name: ${p.fullName}
Education: ${p.educationLevel ?? "?"} at ${p.schoolName ?? "?"}, Major: ${p.major ?? p.intendedMajor ?? "Undeclared"}${p.gpa ? `, GPA ${p.gpa}` : ""}
Career goal: ${p.longTermGoals ?? "Not specified"}
Career interests: ${(p.careerInterests ?? []).join(", ") || "Not specified"}
First-generation college student: ${p.isFirstGeneration ? "YES" : "no / unknown"}
Financial context: ${p.financialNeedContext ?? "Not shared"}
Skills: ${(p.skills ?? []).slice(0, 10).join(", ") || "—"}

ACHIEVEMENTS (real — the only raw material you may use):
${achievements || "- None recorded yet"}

${stories}
${input.extraNotes ? `\nSTUDENT'S NOTES FOR THIS SPECIFIC SCHOLARSHIP (treat as prime material — they typed this because it matters):\n${input.extraNotes}` : ""}`;
}

export async function generateEssayStrategy(
  input: EssayGenerationInput
): Promise<EssayStrategyResult> {
  const prompt = `Build the winning strategy for this essay BEFORE any writing happens. Think like the Tanabe workshop: find the angle that passes the Thumb Test, pick ONE scene, run the "but why?" chain, and define the growth arc.

SCHOLARSHIP: ${input.scholarshipName}
${input.scholarshipMission ? `WHAT THE FUNDER VALUES: ${input.scholarshipMission}` : ""}
${input.funderIntelligence ? `\nFUNDER INTELLIGENCE (researched from the organization's own website — use for mission alignment, never parrot it back):\n${input.funderIntelligence}\n` : ""}
ESSAY PROMPT: "${input.prompt}"
WORD LIMIT: ${input.wordLimit ?? "not specified (assume ~500)"}

THE STUDENT'S REAL MATERIAL:
${buildStudentDossier(input)}

Return JSON:
{
  "strategy": "2-3 sentences: the unique angle and why it passes the Thumb Test (no other applicant could write it)",
  "selectedStoryTitle": "which story/experience anchors the essay",
  "centralScene": "the ONE specific moment the essay opens inside — place, action, sensory anchors, drawn only from the student's real material",
  "whyChain": ["surface answer", "deeper why", "deepest why — the real motivation the essay must reach"],
  "keyThemes": ["theme1", "theme2"],
  "openingHook": "the actual first 1-2 sentences — in-scene, tension/motion/image, no warm-up, no thesis, no 'from a young age'. Would a tired reviewer keep reading? If not, it fails.",
  "growthArc": "who the student was before → who they visibly are after",
  "structureOutline": ["hidden pressure beats, NOT school sections: moment → tension → choice → cost → meaning → forward motion, mapped to this story"],
  "warningsToAvoid": ["the specific clichés/mistakes this particular topic invites"],
  "oneSentencePoint": "the entire essay capsulized in one sentence — if this is vague, the strategy failed",
  "endingStyle": "one of: quiet-future | return-to-opening-image | unanswered-next-step | small-image-large-meaning | future-without-bragging — pick the one this story earns",
  "closingLineDirection": "what the final line should leave in the reader's mind — open loop, forward motion, emotional residue; never a neat conclusion",
  "missionAlignment": "the precise overlap between this student's REAL goals and what this funder rewards — expressed as story beats to embody, never lines that flatter or quote the funder",
  "payItForward": "the credible give-back thread grounded in something the student has actually done or concretely plans — folded into the forward motion, never a pageant promise"
}`;

  return callAIJSON<EssayStrategyResult>(prompt, SYSTEM_PROMPTS.ESSAY_WRITER, {
    maxTokens: 2048,
    apiKey: input.apiKey,
  });
}

export async function generateEssayDraft(
  input: EssayGenerationInput,
  strategy: EssayStrategyResult
): Promise<string> {
  const target = input.wordLimit ?? 500;

  const prompt = `Write the complete essay now, executing this strategy with full SHOW DON'T TELL discipline.

SCHOLARSHIP: ${input.scholarshipName}
PROMPT: "${input.prompt}"
TARGET LENGTH: ${target} words — NEVER exceed it; land just under (within ~5%). Committees reject over-limit essays on sight.

LOCKED STRATEGY:
- Angle: ${strategy.strategy}
- Central scene: ${strategy.centralScene}
- Opening hook: ${strategy.openingHook}
- Why-chain to reach: ${strategy.whyChain.join(" → ")}
- Growth arc: ${strategy.growthArc}
- Hidden pressure beats (never visible as sections): ${strategy.structureOutline.join(" | ")}
- One-sentence point: ${strategy.oneSentencePoint}
- Mission alignment to embody (never announce): ${strategy.missionAlignment ?? "let the student's real values surface naturally"}
- Pay-it-forward thread: ${strategy.payItForward ?? "ground any give-back in what the student has actually done"}
- Ending style: ${strategy.endingStyle ?? "choose the open-loop style this story earns"}
- Final line must leave: ${strategy.closingLineDirection ?? "forward motion and emotional residue — never a neat conclusion"}
- Do NOT commit: ${strategy.warningsToAvoid.join("; ")}
${input.funderIntelligence ? `\nFUNDER INTELLIGENCE (align to this — never quote or flatter it):\n${input.funderIntelligence}\n` : ""}
${input.toneDirective ? `\nVOICE & TONE (the student chose this — honor it in every sentence):\n${input.toneDirective}\n` : ""}

THE STUDENT'S REAL MATERIAL (you may not use anything not present here):
${buildStudentDossier(input)}

PARAGRAPH RHYTHM: break on emotional pressure, not structure. Vary lengths — a one-sentence paragraph when a realization lands; longer ones to build a scene. No five equal blocks. Transitions must be invisible movement ("The harder part came later."), never academic connectors.

FINAL NARRATIVE AUDIT — run every question before you output; if any answer is no, revise first:
1. Does the first sentence hook immediately — would a tired scholarship reviewer keep reading?
2. Does the first paragraph create curiosity without explaining the whole essay?
3. Does the essay begin with story instead of explanation?
4. Do the transitions feel natural instead of academic?
5. Do the paragraph breaks create rhythm — does it look human on the page?
6. Is every claimed trait shown in action, never stated?
7. Does the why-chain's deepest answer surface through reflection, not announcement?
8. Does the ending open a loop instead of closing too perfectly?
9. Does the final line leave emotional residue — the reader wanting more?
10. Does the essay feel like a person, not a template?
11. Would THIS funder finish it thinking "this student is what we fund" — alignment embodied, never announced?
12. Does the reader feel they are investing in a rising student, not rescuing a hardship case?
13. Is it under the word limit with every question in the prompt answered?

Output ONLY the essay text — no title, no labels, no preamble.`;

  return callAI(prompt, SYSTEM_PROMPTS.ESSAY_WRITER, {
    maxTokens: 3000,
    apiKey: input.apiKey,
  });
}

interface EssayCritiqueResult {
  scores: EssayScores;
  feedback: EssayFeedback;
}

export async function critiqueEssay(
  essay: string,
  prompt: string,
  wordLimit?: number,
  apiKey?: string
): Promise<EssayCritiqueResult> {
  const wordCount = essay.trim().split(/\s+/).length;

  const aiPrompt = `Score and critique this scholarship essay against the Tanabe standard AND the Narrative Magnetism audit: Thumb Test originality, show-don't-tell density, one-slice focus, why-chain depth, growth arc, sentence economy, immediate hook (would a tired reviewer keep reading?), invisible transitions, human paragraph rhythm, and an open-loop ending that leaves emotional residue rather than a neat conclusion.

ESSAY PROMPT: ${prompt}
WORD LIMIT: ${wordLimit ?? "Not specified"}
ACTUAL WORD COUNT: ${wordCount}

ESSAY:
${essay}

Return JSON:
{
  "scores": {
    "overall": 0-100,
    "promptAlignment": 0-100,
    "specificity": 0-100,
    "storyStrength": 0-100,
    "emotionalAuthenticity": 0-100,
    "scholarshipFit": 0-100,
    "structure": 0-100,
    "clarity": 0-100,
    "openingStrength": 0-100,
    "conclusionStrength": 0-100,
    "wordCountFit": 0-100,
    "clicheRisk": 0-100,
    "aiSoundingRisk": 0-100
  },
  "feedback": {
    "strengths": ["specific strength 1", "specific strength 2"],
    "weaknesses": ["specific issue 1 — cite the exact sentence", "..."],
    "revisions": ["specific actionable revision 1", "..."],
    "wordCount": ${wordCount},
    "targetWordCount": ${wordLimit ?? null}
  }
}`;

  return callAIJSON<EssayCritiqueResult>(aiPrompt, SYSTEM_PROMPTS.ESSAY_WRITER, {
    maxTokens: 2048,
    apiKey,
  });
}

export async function reviseEssay(
  essay: string,
  revisionInstructions: string,
  wordLimit?: number,
  apiKey?: string
): Promise<string> {
  const prompt = `Revise this scholarship essay per the instructions, preserving the student's voice and every real fact. Apply show-don't-tell discipline to anything you touch: scenes over statements, senses over summary, growth visible. Keep the hook immediate, transitions invisible, paragraph rhythm human, and the ending an open loop — run the Final Narrative Audit before returning.

REVISION INSTRUCTIONS:
${revisionInstructions}

WORD LIMIT: ${wordLimit ?? "Not specified"}

ORIGINAL ESSAY:
${essay}

Output only the revised essay text. No title, no labels, no explanation.`;

  return callAI(prompt, SYSTEM_PROMPTS.ESSAY_WRITER, { maxTokens: 3000, apiKey });
}
