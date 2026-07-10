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
  // API configuration
  apiKey: string | null;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  setApiKey: (key: string) => void;
  setSupabaseConfig: (url: string, anonKey: string) => void;

  // Auth
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  /** Sign in as a (possibly different) account: clears the previous user's data and adopts the server profile. */
  signIn: (user: User, serverProfile: StudentProfile | null) => void;
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

  // Hydration flag — true once Zustand has read from localStorage
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

/** Fire-and-forget: persist the profile onto the server account (encrypted at rest, token-authenticated). */
function syncProfileToServer(token: string | undefined, profile: StudentProfile | null) {
  if (!token || !profile || typeof window === "undefined") return;
  fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ profile }),
  }).catch(() => {});
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // API configuration
      apiKey: null,
      supabaseUrl: null,
      supabaseAnonKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      setSupabaseConfig: (url, anonKey) => set({ supabaseUrl: url, supabaseAnonKey: anonKey }),

      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      signIn: (user, serverProfile) => {
        const previous = get().user;
        const sameAccount = previous?.email?.toLowerCase() === user.email.toLowerCase();
        set({
          user,
          isLoggedIn: true,
          // A different account must never inherit the previous student's data
          profile: serverProfile ?? (sameAccount ? get().profile : null),
          ...(sameAccount
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
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
          profile: null,
          onboardingComplete: false,
          onboardingStep: 0,
          savedScholarships: [],
          essayDrafts: [],
          gapAnalysis: null,
        }),

      profile: null,
      setProfile: (profile) => {
        // Enforce honest strength no matter how the profile was built
        const next = profile ? { ...profile, profileStrength: computeProfileStrength(profile) } : profile;
        set({ profile: next });
        syncProfileToServer(get().user?.token, next);
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
        syncProfileToServer(user?.token, next);
      },

      onboardingComplete: false,
      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () => set({ onboardingComplete: true }),

      savedScholarships: [],
      addScholarship: (scholarship) =>
        set((s) => ({ savedScholarships: [...s.savedScholarships, scholarship] })),
      updateScholarship: (id, updates) =>
        set((s) => ({
          savedScholarships: s.savedScholarships.map((sc) =>
            sc.id === id ? { ...sc, ...updates } : sc
          ),
        })),
      removeScholarship: (id) =>
        set((s) => ({
          savedScholarships: s.savedScholarships.filter((sc) => sc.id !== id),
        })),

      essayDrafts: [],
      addEssayDraft: (draft) =>
        set((s) => ({ essayDrafts: [...s.essayDrafts, draft] })),
      updateEssayDraft: (id, updates) =>
        set((s) => ({
          essayDrafts: s.essayDrafts.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      gapAnalysis: null,
      setGapAnalysis: (analysis) => set({ gapAnalysis: analysis }),

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
      },
      partialize: (s) => ({
        apiKey: s.apiKey,
        supabaseUrl: s.supabaseUrl,
        supabaseAnonKey: s.supabaseAnonKey,
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
