/**
 * House-style enforcement for all generated prose.
 *
 * Two hard rules, owner-mandated:
 *   1. ABSOLUTELY no em dashes (or en dashes / double-hyphens used as dashes).
 *   2. ABSOLUTELY no tricolons / stacked three-item lists ("a, b, and c").
 *
 * Rule 1 is guaranteed here in code — models emit em dashes even when told not
 * to, so we strip them deterministically as a last line of defense. Rule 2
 * can't be regex-rewritten without mangling meaning, so it's enforced in the
 * prompt + the pre-output audit; this module only reports suspected tricolons
 * for logging, it never rewrites them.
 */

/** Guarantee no em/en/bar dashes or "--" survive. Hyphens in words are untouched. */
export function stripDashes(text: string): string {
  let t = text;
  // Number ranges read as "to" rather than a comma (e.g. "2020–2024").
  t = t.replace(/(\d)\s*[—–―]\s*(\d)/g, "$1 to $2");
  // Any remaining em/en/bar dash, or a double-hyphen used as a dash, becomes a comma.
  t = t.replace(/\s*(?:[—–―]|--+)\s*/g, ", ");
  // Clean up the artifacts that substitution can create.
  t = t.replace(/,\s*,/g, ", ");        // collapse double commas
  t = t.replace(/\s+,/g, ",");           // no space before a comma
  t = t.replace(/,\s*([.!?;:])/g, "$1"); // no comma right before terminal punctuation
  t = t.replace(/([.!?;:])\s*,/g, "$1"); // ...or right after it
  t = t.replace(/[ \t]{2,}/g, " ");      // collapse runs of spaces
  return t.trim();
}

/** Full house-style pass applied to every user-facing generated string. */
export function enforceHouseStyle(text: string): string {
  if (!text) return text;
  return stripDashes(text);
}

function stripMarkdownFormatting(text: string): string {
 return text
  .replace(/\*\*([^*\n]+)\*\*/g, "$1")
  .replace(/\*([^*\n]+)\*/g, "$1")
  .replace(/__([^_\n]+)__/g, "$1")
  .replace(/_([^_\n]+)_/g, "$1")
  .replace(/`([^`\n]+)`/g, "$1")
  .replace(/^\s{0,3}#{1,6}\s+/gm, "")
  .replace(/^\s{0,3}>\s?/gm, "")
  .replace(/^\s*[-*]\s+/gm, "");
}

function addReadableParagraphBreaks(text: string): string {
 const trimmed = text.trim();
 if (!trimmed || /\n\s*\n/.test(trimmed) || countWords(trimmed) < 220) return trimmed;

 const sentences = trimmed.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g);
 if (!sentences || sentences.length < 5) return trimmed;

 const paragraphs: string[] = [];
 let current: string[] = [];
 let currentWords = 0;

 for (const rawSentence of sentences) {
  const sentence = rawSentence.trim();
  if (!sentence) continue;
  const sentenceWords = countWords(sentence);
  current.push(sentence);
  currentWords += sentenceWords;
  if (currentWords >= 115 && paragraphs.length < 5) {
   paragraphs.push(current.join(" "));
   current = [];
   currentWords = 0;
  }
 }

 if (current.length) paragraphs.push(current.join(" "));
 return paragraphs.join("\n\n");
}

/** Make generated essays ready to paste into scholarship portals. */
export function formatEssayForApplication(text: string): string {
 if (!text) return text;
 const plain = stripMarkdownFormatting(enforceHouseStyle(text))
  .replace(/\r\n/g, "\n")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();
 return addReadableParagraphBreaks(plain);
}

export function countWords(text: string): number {
 return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Hard safety net for application portals that reject text over their limit. */
export function clampToWordLimit(text: string, limit?: number): string {
 if (!limit || limit < 1 || countWords(text) <= limit) return text.trim();
 const words = text.trim().split(/\s+/);
 const candidate = words.slice(0, limit).join(" ");
 const sentenceEnd = Math.max(candidate.lastIndexOf("."), candidate.lastIndexOf("!"), candidate.lastIndexOf("?"));
 if (sentenceEnd > candidate.length * 0.7) return candidate.slice(0, sentenceEnd + 1).trim();
 return candidate.replace(/[,;:]?$/, ".").trim();
}

/** Best-effort detector for the classic "a, b, and c" tricolon (for logging only). */
export function hasSuspectedTricolon(text: string): boolean {
  return /\b[^.!?\n,]{1,80},\s+[^.!?\n,]{1,80},\s+(?:and|or)\s+[^.!?\n,]{1,80}/i.test(text);
}
