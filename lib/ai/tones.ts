/**
 * Audri Voice System
 *
 * Instead of a flat list of a handful of "tones," Audri models voice as three
 * orthogonal dimensions, ARCHETYPE (the writer's stance), TEXTURE (the
 * emotional grain), and REGISTER (the formality/cadence). Every combination is
 * a distinct, usable voice with its own concrete writing directive.
 *
 * 20 archetypes × 12 textures × 6 registers = 1,440 voices.
 *
 * The directive is what actually shapes the essay: it changes HOW the student's
 * real story is told, never WHAT is true. All accuracy/anti-fabrication rules
 * still win over any voice.
 */

export interface ToneFacet {
 key: string;
 label: string;
 directive: string;
}

export const TONE_ARCHETYPES: ToneFacet[] = [
 { key: "storyteller", label: "Storyteller", directive: "lead with narrative motion and let specific scenes carry the meaning" },
 { key: "analyst", label: "Analyst", directive: "reason in clear cause-and-effect, drawing a precise line from experience to insight" },
 { key: "optimist", label: "Optimist", directive: "look forward with earned hope, finding the opening in every obstacle without denying it" },
 { key: "realist", label: "Realist", directive: "stay grounded and unsentimental, naming hard things plainly and respecting the reader's intelligence" },
 { key: "advocate", label: "Advocate", directive: "write with conviction and clear stakes, making the reader feel why this matters" },
 { key: "craftsman", label: "Craftsman", directive: "make every sentence earn its place, favoring precision and control over flourish" },
 { key: "underdog", label: "Underdog", directive: "carry quiet, earned determination, confidence without self-pity or excuse" },
 { key: "visionary", label: "Visionary", directive: "connect the small moment to a larger arc, showing where this is all heading" },
 { key: "observer", label: "Quiet Observer", directive: "notice the detail others miss, staying restrained and perceptive" },
 { key: "direct", label: "Straight Shooter", directive: "say it plainly and without hedging, short, clear, unafraid" },
 { key: "bridge", label: "Bridge-Builder", directive: "write with empathy, connecting people and ideas and inviting the reader in" },
 { key: "scientist", label: "Scientist", directive: "stay curious and evidence-first, letting genuine intellectual honesty show" },
 { key: "poet", label: "Poet", directive: "use image-driven, rhythm-aware language with disciplined restraint" },
 { key: "mentor", label: "Mentor", directive: "reflect with hard-won wisdom, generous and steady in what it has learned" },
 { key: "fighter", label: "Fighter", directive: "keep resilient forward momentum and high energy through the whole piece" },
 { key: "humanist", label: "Humanist", directive: "stay warm and people-centered, emotionally intelligent about everyone in the story" },
 { key: "minimalist", label: "Minimalist", directive: "be spare and economical, trusting silence and the unsaid to do work" },
 { key: "builder", label: "Builder", directive: "stay pragmatic and action-oriented, showing things actually made and done" },
 { key: "seeker", label: "Seeker", directive: "stay introspective and question-driven, foregrounding real growth over answers" },
 { key: "trailblazer", label: "Trailblazer", directive: "sound independent and unconventional, the first to try, unbothered by the usual path" },
];

export const TONE_TEXTURES: ToneFacet[] = [
 { key: "warm", label: "Warm", directive: "generous human warmth" },
 { key: "measured", label: "Measured", directive: "calm, composed, deliberate control" },
 { key: "bold", label: "Bold", directive: "assertive, high-conviction energy" },
 { key: "tender", label: "Tender", directive: "gentle, emotionally open honesty" },
 { key: "understated", label: "Understated", directive: "restraint that lets the facts land on their own" },
 { key: "earnest", label: "Earnest", directive: "sincere and unironic" },
 { key: "wry", label: "Wry", directive: "a dry, self-aware wit that never tips into slapstick" },
 { key: "luminous", label: "Luminous", directive: "a bright, vivid, hopeful glow" },
 { key: "grounded", label: "Grounded", directive: "concrete and down-to-earth" },
 { key: "fierce", label: "Fierce", directive: "intense, urgent passion" },
 { key: "serene", label: "Serene", directive: "unhurried, peaceful clarity" },
 { key: "candid", label: "Candid", directive: "frank, disarming honesty" },
];

export const TONE_REGISTERS: ToneFacet[] = [
 { key: "conversational", label: "Conversational", directive: "a natural, spoken cadence" },
 { key: "polished", label: "Polished", directive: "clean, refined, professional phrasing" },
 { key: "literary", label: "Literary", directive: "evocative, artful language with varied sentence rhythm" },
 { key: "plainspoken", label: "Plainspoken", directive: "simple words and direct sentences" },
 { key: "elevated", label: "Elevated", directive: "a dignified, formal, precise register" },
 { key: "intimate", label: "Intimate", directive: "a close, confiding, personal voice" },
];

const A = Object.fromEntries(TONE_ARCHETYPES.map((f) => [f.key, f]));
const T = Object.fromEntries(TONE_TEXTURES.map((f) => [f.key, f]));
const R = Object.fromEntries(TONE_REGISTERS.map((f) => [f.key, f]));

export interface ToneOption {
 id: string; // "archetype.texture.register"
 label: string; // "Wry Storyteller · Literary"
 hint: string; // short searchable descriptor
}

/** The full, generated library. 20 × 12 × 6 = 1,440 voices. */
export const TONE_LIBRARY: ToneOption[] = (() => {
 const out: ToneOption[] = [];
 for (const a of TONE_ARCHETYPES) {
 for (const t of TONE_TEXTURES) {
 for (const r of TONE_REGISTERS) {
 out.push({
 id: `${a.key}.${t.key}.${r.key}`,
 label: `${t.label} ${a.label} · ${r.label}`,
 hint: `${t.label.toLowerCase()} ${a.label.toLowerCase()} ${r.label.toLowerCase()}`,
 });
 }
 }
 }
 return out;
})();

export const TONE_COUNT = TONE_LIBRARY.length; // 1,440

/** A few sensible quick-picks surfaced above the search. */
export const FEATURED_TONE_IDS = [
 "storyteller.warm.conversational",
 "realist.candid.plainspoken",
 "advocate.bold.polished",
 "poet.luminous.literary",
 "underdog.measured.intimate",
 "analyst.grounded.polished",
];

export const DEFAULT_TONE_ID = "storyteller.warm.conversational";

export interface ToneSelection {
 archetype: string;
 texture: string;
 register: string;
}

export function parseToneId(id: string | undefined | null): ToneSelection | undefined {
 if (!id) return undefined;
 const [archetype, texture, register] = id.split(".");
 if (!A[archetype] || !T[texture] || !R[register]) return undefined;
 return { archetype, texture, register };
}

export function composeToneId(selection: ToneSelection): string {
 return `${selection.archetype}.${selection.texture}.${selection.register}`;
}

export function searchToneOptions(query: string, limit = 60): ToneOption[] {
 const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 if (!terms.length) return [];
 return TONE_LIBRARY.filter((option) => terms.every((term) => option.hint.includes(term))).slice(0, limit);
}

function sentenceCase(text: string): string {
 return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getToneDescription(id: string | undefined | null): string | undefined {
 const selection = parseToneId(id);
 if (!selection) return undefined;
 const archetype = A[selection.archetype];
 const texture = T[selection.texture];
 const register = R[selection.register];
 return `${sentenceCase(archetype.directive)}. It carries ${texture.directive} and uses ${register.directive}.`;
}

/** Compose the actual writing directive injected into the essay prompt. */
export function getToneDirective(id: string | undefined | null): string | undefined {
 if (!id) return undefined;
 const [ak, tk, rk] = id.split(".");
 const a = A[ak]; const t = T[tk]; const r = R[rk];
 if (!a || !t || !r) return undefined;
 return `Write in this voice, ${t.label} ${a.label}, ${r.label}: ${a.directive}; carry ${t.directive}; use ${r.directive}. Apply this voice to HOW the essay is written only, never bend, invent, or omit a fact to fit the tone, and never let voice override the show-don't-tell and accuracy rules.`;
}

export function getToneLabel(id: string | undefined | null): string | undefined {
 return TONE_LIBRARY.find((o) => o.id === id)?.label;
}
