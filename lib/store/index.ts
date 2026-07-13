"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeProfileStrength } from "@/lib/utils";
import type {
 StudentProfile,
 SavedScholarship,
 EssayDraft,
 GapAnalysis,
 User,
} from "@/lib/types";

interface AppState {
 // Auth
 user: User | null;
 isLoggedIn: boolean;
 setUser: (user: User | null) => void;
 /** Sign in as a (possibly different) account: clears the previous user's data and adopts the server profile. */
 signIn: (user: User, serverProfile: StudentProfile | null, serverWorkspace?: ServerWorkspace | null) => void;
 login: (email: string, name: string) => void;
 logout: () => void;

 // Student Profile
 profile: StudentProfile | null;
 setProfile: (profile: StudentProfile) => void;
 updateProfile: (updates: Partial<StudentProfile>) => void;

 // Onboarding
 onboardingComplete: boolean;
 onboardingStep: number;
 setOnboardingStep: (step: number) => void;
 completeOnboarding: () => void;

 // Saved Scholarships
 savedScholarships: SavedScholarship[];
 addScholarship: (scholarship: SavedScholarship) => void;
 updateScholarship: (id: string, updates: Partial<SavedScholarship>) => void;
 removeScholarship: (id: string) => void;

 // Essay Drafts
 essayDrafts: EssayDraft[];
 addEssayDraft: (draft: EssayDraft) => void;
 updateEssayDraft: (id: string, updates: Partial<EssayDraft>) => void;

 // Gap Analysis
 gapAnalysis: GapAnalysis | null;
 setGapAnalysis: (analysis: GapAnalysis) => void;

 // Daily goal + streak (motivation engine)
 dailyGoal: { date: string; target: number; completed: number } | null;
 setDailyGoal: (target: number) => void;
 logApplicationFinished: () => void;
 streak: { count: number; lastActiveDate: string };

 // Story Studio → Generator handoff (a chosen story angle to prefill)
 pendingStoryAngle: string | null;
 setPendingStoryAngle: (note: string | null) => void;

 // UI state
 sidebarOpen: boolean;
 setSidebarOpen: (open: boolean) => void;

 // Hydration flag, true once Zustand has read from localStorage
 _hasHydrated: boolean;
 setHasHydrated: (v: boolean) => void;
}

interface ServerWorkspace {
 onboardingComplete?: boolean;
 onboardingStep?: number;
 savedScholarships?: SavedScholarship[];
 essayDrafts?: EssayDraft[];
 gapAnalysis?: GapAnalysis | null;
 dailyGoal?: { date: string; target: number; completed: number } | null;
 streak?: { count: number; lastActiveDate: string };
}

let workspaceTimer: ReturnType<typeof setTimeout> | null = null;

function syncWorkspaceToServer(state: AppState) {
 if (typeof window === "undefined" || !state.user) return;
 if (workspaceTimer) clearTimeout(workspaceTimer);
 workspaceTimer = setTimeout(() => {
  const workspace: ServerWorkspace = {
   onboardingComplete: state.onboardingComplete,
   onboardingStep: state.onboardingStep,
   savedScholarships: state.savedScholarships,
   essayDrafts: state.essayDrafts,
   gapAnalysis: state.gapAnalysis,
   dailyGoal: state.dailyGoal,
   streak: state.streak,
  };
  fetch("/api/auth/workspace", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
    ...(state.user?.token ? { Authorization: "Bearer " + state.user.token } : {}),
   },
   body: JSON.stringify({ workspace }),
  }).catch(() => {});
 }, 500);
}

/** Fire-and-forget: persist the profile onto the server account (encrypted at rest, token-authenticated). */
function syncProfileToServer(token: string | undefined, profile: StudentProfile | null, signedIn: boolean) {
 if (!signedIn || !profile || typeof window === "undefined") return;
 fetch("/api/auth/profile", {
 method: "POST",
 headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
 body: JSON.stringify({ profile }),
 }).catch(() => {});
}

export const useAppStore = create<AppState>()(
 persist(
 (set, get) => ({
 user: null,
 isLoggedIn: false,
 setUser: (user) => set({ user, isLoggedIn: !!user }),
 signIn: (user, serverProfile, serverWorkspace) => {
 const previous = get().user;
 const sameAccount = previous?.email?.toLowerCase() === user.email.toLowerCase();
 set({
 user,
 isLoggedIn: true,
 // A different account must never inherit the previous student's data
 profile: serverProfile ?? (sameAccount ? get().profile : null),
  ...(serverWorkspace
  ? {
  onboardingComplete: serverWorkspace.onboardingComplete ?? !!serverProfile,
  onboardingStep: serverWorkspace.onboardingStep ?? 0,
  savedScholarships: serverWorkspace.savedScholarships ?? [],
  essayDrafts: serverWorkspace.essayDrafts ?? [],
  gapAnalysis: serverWorkspace.gapAnalysis ?? null,
  dailyGoal: serverWorkspace.dailyGoal ?? null,
  streak: serverWorkspace.streak ?? { count: 0, lastActiveDate: "" },
  }
  : sameAccount
  ? {}
 : {
 savedScholarships: [],
 essayDrafts: [],
 gapAnalysis: null,
 onboardingComplete: !!serverProfile,
 onboardingStep: 0,
  }),
 });
 },
 login: (email, name) => {
 const user: User = {
 id: `user_${Date.now()}`,
 email,
 name,
 role: "STUDENT",
 createdAt: new Date().toISOString(),
 };
 set({ user, isLoggedIn: true });
 },
 logout: () => {
 if (typeof window !== "undefined") fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
 set({
 user: null,
 isLoggedIn: false,
 profile: null,
 onboardingComplete: false,
 onboardingStep: 0,
 savedScholarships: [],
 essayDrafts: [],
 gapAnalysis: null,
 });
 },

 profile: null,
 setProfile: (profile) => {
 // Enforce honest strength no matter how the profile was built
 const next = profile ? { ...profile, profileStrength: computeProfileStrength(profile) } : profile;
 set({ profile: next });
 syncProfileToServer(get().user?.token, next, Boolean(get().user));
 },
 updateProfile: (updates) => {
 const current = get().profile;
 const user = get().user;
 // No profile yet? Create one from the signed-in account so edits are
 // NEVER silently discarded.
 const base: StudentProfile =
 current ??
 ({
 id: `profile_${Date.now()}`,
 userId: user?.id ?? "",
 fullName: user?.name ?? "",
 email: user?.email ?? "",
 careerInterests: [],
 demographics: [],
 languages: [],
 skills: [],
 certifications: [],
 achievements: [],
 stories: [],
 profileStrength: 0,
 profileStrengthBreakdown: {
 academics: 0, leadership: 0, service: 0, workExperience: 0, awards: 0,
 storyDepth: 0, careerClarity: 0, financialNeedClarity: 0,
 applicationReadiness: 0, recommendationReadiness: 0,
 },
 scholarshipPreferences: { categories: [] },
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 } as StudentProfile);

 const merged = { ...base, ...updates, updatedAt: new Date().toISOString() };
 // Always keep strength honest and in sync with the actual profile contents
 const next = { ...merged, profileStrength: computeProfileStrength(merged) };
 set({ profile: next });
 syncProfileToServer(user?.token, next, Boolean(user));
 },

 onboardingComplete: false,
 onboardingStep: 0,
 setOnboardingStep: (step) => {
  set({ onboardingStep: step });
  syncWorkspaceToServer(get());
 },
 completeOnboarding: () => {
  set({ onboardingComplete: true });
  syncWorkspaceToServer(get());
 },

 savedScholarships: [],
 addScholarship: (scholarship) => {
  set((s) => ({ savedScholarships: [...s.savedScholarships, scholarship] }));
  syncWorkspaceToServer(get());
 },
 updateScholarship: (id, updates) => {
 set((s) => ({
 savedScholarships: s.savedScholarships.map((sc) =>
 sc.id === id ? { ...sc, ...updates } : sc
 ),
 }));
  syncWorkspaceToServer(get());
 },
 removeScholarship: (id) => {
 set((s) => ({
 savedScholarships: s.savedScholarships.filter((sc) => sc.id !== id),
 }));
  syncWorkspaceToServer(get());
 },

 essayDrafts: [],
 addEssayDraft: (draft) => {
  set((s) => ({ essayDrafts: [...s.essayDrafts, draft] }));
  syncWorkspaceToServer(get());
 },
 updateEssayDraft: (id, updates) => {
 set((s) => ({
 essayDrafts: s.essayDrafts.map((d) =>
 d.id === id ? { ...d, ...updates } : d
 ),
 }));
  syncWorkspaceToServer(get());
 },

 gapAnalysis: null,
 setGapAnalysis: (analysis) => {
  set({ gapAnalysis: analysis });
  syncWorkspaceToServer(get());
 },

 dailyGoal: null,
 streak: { count: 0, lastActiveDate: "" },
 setDailyGoal: (target) => {
 const today = new Date().toISOString().slice(0, 10);
 const existing = get().dailyGoal;
 set({
 dailyGoal:
 existing && existing.date === today
 ? { ...existing, target }
 : { date: today, target, completed: 0 },
 });
 syncWorkspaceToServer(get());
 },
 logApplicationFinished: () => {
 const today = new Date().toISOString().slice(0, 10);
 const goal = get().dailyGoal;
 const streak = get().streak;

 const updatedGoal =
 goal && goal.date === today
 ? { ...goal, completed: goal.completed + 1 }
 : { date: today, target: goal?.target ?? 1, completed: 1 };

 let updatedStreak = streak;
 if (streak.lastActiveDate !== today) {
 const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
 updatedStreak =
 streak.lastActiveDate === yesterday
 ? { count: streak.count + 1, lastActiveDate: today }
 : { count: 1, lastActiveDate: today };
 }

 set({ dailyGoal: updatedGoal, streak: updatedStreak });
 syncWorkspaceToServer(get());
 },

 pendingStoryAngle: null,
 setPendingStoryAngle: (note) => set({ pendingStoryAngle: note }),

 sidebarOpen: true,
 setSidebarOpen: (open) => set({ sidebarOpen: open }),

 _hasHydrated: false,
 setHasHydrated: (v) => set({ _hasHydrated: v }),
 }),
 {
 name: "audri-store",
 onRehydrateStorage: () => (state) => {
 state?.setHasHydrated(true);
 const token = state?.user?.token;
 if (token && typeof window !== "undefined") {
  fetch("/api/auth/session", { method: "POST", headers: { Authorization: "Bearer " + token } })
   .then((response) => {
    if (response.ok && state.user) state.setUser({ ...state.user, token: undefined });
   })
   .catch(() => {});
 }
 },
 partialize: (s) => ({
 user: s.user,
 isLoggedIn: s.isLoggedIn,
 profile: s.profile,
 onboardingComplete: s.onboardingComplete,
 onboardingStep: s.onboardingStep,
 savedScholarships: s.savedScholarships,
 essayDrafts: s.essayDrafts,
 gapAnalysis: s.gapAnalysis,
 dailyGoal: s.dailyGoal,
 streak: s.streak,
 }),
 }
 )
);
