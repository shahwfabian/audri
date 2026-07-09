import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past deadline";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `${diffDays} days left`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function scoreToBg(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  if (score >= 40) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

export function probabilityToColor(level: string): string {
  switch (level) {
    case "HIGH": return "text-green-600";
    case "MEDIUM_HIGH": return "text-emerald-600";
    case "MODERATE": return "text-yellow-600";
    case "LOW": return "text-red-500";
    default: return "text-gray-500";
  }
}

export function probabilityLabel(level: string): string {
  switch (level) {
    case "HIGH": return "High";
    case "MEDIUM_HIGH": return "Medium-High";
    case "MODERATE": return "Moderate";
    case "LOW": return "Low";
    default: return "Unknown";
  }
}

/**
 * Honest profile strength (0–100). Weights the material that actually wins
 * scholarships — achievements and stories — far above basic bio fields, so a
 * profile with no real experiences never reads as "strong."
 */
export function computeProfileStrength(profile: {
  educationLevel?: unknown; schoolName?: unknown; major?: unknown; intendedMajor?: unknown; gpa?: unknown;
  longTermGoals?: unknown; careerInterests?: unknown[]; financialNeedContext?: unknown; state?: unknown;
  isFirstGeneration?: unknown; achievements?: unknown[]; stories?: unknown[]; skills?: unknown[];
} | null | undefined): number {
  if (!profile) return 0;
  let score = 0;
  // Basics — necessary but not sufficient (max 20)
  if (profile.educationLevel) score += 5;
  if (profile.schoolName) score += 5;
  if (profile.major || profile.intendedMajor) score += 5;
  if (profile.gpa) score += 5;
  // Goals & eligibility context (max 20)
  if (profile.longTermGoals) score += 7;
  if (profile.careerInterests?.length) score += 4;
  if (profile.financialNeedContext) score += 3;
  if (profile.state) score += 3;
  if (profile.isFirstGeneration !== undefined && profile.isFirstGeneration !== null) score += 3;
  // Achievements — the raw material for every essay (max 30)
  score += Math.min(5, profile.achievements?.length ?? 0) * 6;
  // Stories — narrative assets (max 20)
  score += Math.min(3, profile.stories?.length ?? 0) * 7;
  // Skills (max 10)
  score += Math.min(5, profile.skills?.length ?? 0) * 2;
  return Math.min(100, Math.round(score));
}
