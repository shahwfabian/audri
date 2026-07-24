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
