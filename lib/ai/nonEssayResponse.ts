const NON_ESSAY_PATTERNS = [
  /\bi need to be direct\b/i,
  /\bbefore i write\b/i,
  /\bwhat i need from\b/i,
  /\bi cannot fabricate\b/i,
  /\bto write this essay\b/i,
  /\bwithout a real\b/i,
  /\bthe student's vault is empty\b/i,
  /\bfoundational one\b/i,
  /\bacademic fraud\b/i,
  /\binvent (?:scenes|jobs|projects|details|a first-generation identity)\b/i,
];

export function isNonEssayResponse(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  const patternHits = NON_ESSAY_PATTERNS.filter((pattern) => pattern.test(normalized)).length;
  const questionLines = text.split(/\r?\n/).filter((line) => /^\s*\d+\.\s+/.test(line)).length;
  return patternHits >= 2 || questionLines >= 3;
}
