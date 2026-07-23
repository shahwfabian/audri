import type { Achievement, Story, StudentProfile } from "@/lib/types";
import { STORY_DETAIL_MARKER } from "@/lib/ai/storyStarters";

const MIN_DETAIL_CHARACTERS = 40;
const EXPERIENCE_SIGNAL =
 /\b(?:after|before|during|every|handled|led|managed|noticed|once|opened|organized|repaired|started|taught|translated|volunteered|when|while|worked)\b|\d/i;

type EssayProfile = Partial<Pick<StudentProfile, "achievements" | "stories">>;

function cleanText(value: unknown): string {
 if (typeof value !== "string") return "";
 return value.replace(/\s+/g, " ").trim();
}

function combinedLength(values: unknown[]): number {
 return cleanText(values.map(cleanText).filter(Boolean).join(" ")).length;
}

function hasMeaningfulAchievement(value: unknown): boolean {
 if (!value || typeof value !== "object") return false;
 const achievement = value as Partial<Achievement>;
 const details = [
  achievement.description,
  achievement.impact,
  achievement.role,
  ...(Array.isArray(achievement.metrics) ? achievement.metrics : []),
 ];
 return cleanText(achievement.title).length > 0
  && combinedLength([achievement.title, ...details]) >= MIN_DETAIL_CHARACTERS
  && combinedLength(details) >= 20;
}

function hasMeaningfulStory(value: unknown): boolean {
 if (!value || typeof value !== "object") return false;
 const story = value as Partial<Story>;
 const details = [
  story.summary,
  story.conflict,
  story.turningPoint,
  story.outcome,
  ...(Array.isArray(story.keyFacts) ? story.keyFacts : []),
 ];
 return combinedLength(details) >= MIN_DETAIL_CHARACTERS;
}

function studentWrittenNotes(extraNotes: unknown): string {
 const notes = cleanText(extraNotes);
 const markerIndex = notes.lastIndexOf(STORY_DETAIL_MARKER);
 if (markerIndex === -1) return notes;
 return cleanText(notes.slice(markerIndex + STORY_DETAIL_MARKER.length));
}

function hasMeaningfulStudentNote(extraNotes: unknown): boolean {
 const notes = studentWrittenNotes(extraNotes);
 return notes.length >= MIN_DETAIL_CHARACTERS && EXPERIENCE_SIGNAL.test(notes);
}

/**
 * A narrow preflight that asks for one usable source of student truth.
 * It does not trust profileStrength and remains compatible with legacy profiles.
 */
export function hasEssayMaterial(
 profile: EssayProfile | null | undefined,
 suppliedStories: unknown,
 extraNotes: unknown
): boolean {
 if (hasMeaningfulStudentNote(extraNotes)) return true;

 const profileStories = Array.isArray(profile?.stories) ? profile.stories : [];
 const requestStories = Array.isArray(suppliedStories) ? suppliedStories : [];
 if ([...profileStories, ...requestStories].some(hasMeaningfulStory)) return true;

 const achievements = Array.isArray(profile?.achievements) ? profile.achievements : [];
 return achievements.some(hasMeaningfulAchievement);
}

export const ESSAY_MATERIAL_ERROR = {
 code: "PROFILE_NEEDS_ESSAY_MATERIAL",
 error: "Add one real detail from your life before writing. Describe a specific moment or responsibility in the notes box.",
 action: "notes",
} as const;
