"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDeadline } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Trophy,
  FileText,
  BookOpen,
  Search,
  Star,
  Plus,
  X,
  Target,
  Flame,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { ApplicationStatus } from "@/lib/types";

// ---- STATUS BADGE CONFIG ----
const STATUS_STYLE: Record<ApplicationStatus, { bg: string; color: string; border: string; label: string }> = {
  SAVED:             { bg: "rgba(255,255,255,0.04)", color: "var(--text-2)",    border: "var(--border-2)",              label: "Saved" },
  IN_PROGRESS:       { bg: "rgba(201,168,76,0.12)",  color: "var(--gold-light)", border: "rgba(201,168,76,0.35)",        label: "In Progress" },
  DRAFT_READY:       { bg: "rgba(201,168,76,0.08)",  color: "var(--gold)",      border: "rgba(201,168,76,0.25)",        label: "Draft Ready" },
  MISSING_MATERIALS: { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B",          border: "rgba(245,158,11,0.3)",         label: "Missing Materials" },
  SUBMITTED:         { bg: "rgba(34,211,238,0.10)",  color: "#22D3EE",          border: "rgba(34,211,238,0.3)",         label: "Submitted" },
  INTERVIEW:         { bg: "rgba(168,85,247,0.12)",  color: "#C084FC",          border: "rgba(168,85,247,0.3)",         label: "Interview" },
  WON:               { bg: "rgba(32,200,120,0.12)",  color: "var(--green)",     border: "rgba(32,200,120,0.3)",         label: "Won!" },
  REJECTED:          { bg: "rgba(229,80,80,0.12)",   color: "var(--red)",       border: "rgba(229,80,80,0.3)",          label: "Rejected" },
  ARCHIVED:          { bg: "rgba(255,255,255,0.02)", color: "var(--text-3)",    border: "var(--border)",                label: "Archived" },
};

// ---- DAILY CHECKLIST LOGIC ----
interface DailyItem { id: string; text: string; done: boolean; }
interface DailyState { date: string; goal: number; items: DailyItem[]; streak: number; lastCompletedDate: string | null; }

const getTodayKey = () => new Date().toISOString().split("T")[0];

function getDefaultDailyState(): DailyState {
  return { date: getTodayKey(), goal: 3, items: [], streak: 0, lastCompletedDate: null };
}

function loadDailyState(): DailyState {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("audri:daily") : null;
    if (!raw) return getDefaultDailyState();
    const parsed: DailyState = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split("T")[0];
      const streak = parsed.lastCompletedDate === yKey ? parsed.streak : 0;
      return { ...getDefaultDailyState(), streak };
    }
    return parsed;
  } catch {
    return getDefaultDailyState();
  }
}

function saveDailyState(state: DailyState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("audri:daily", JSON.stringify(state));
  }
}

export default function DashboardPage() {
  const { user, profile, savedScholarships, onboardingComplete } = useAppStore();

  // ---- stats ----
  const totalDiscovered = savedScholarships.reduce((sum, s) => sum + (s.scholarship.amount ?? 0), 0);
  const totalWon = savedScholarships.filter((s) => s.status === "WON").reduce((sum, s) => sum + (s.scholarship.amount ?? 0), 0);
  const submitted = savedScholarships.filter((s) => s.status === "SUBMITTED").length;
  const inProgress = savedScholarships.filter((s) => s.status === "IN_PROGRESS" || s.status === "DRAFT_READY").length;
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlinesThisWeek = savedScholarships.filter((s) => {
    if (!s.deadline) return false;
    const d = new Date(s.deadline);
    return d >= now && d <= weekFromNow;
  }).length;
  const profileStrength = profile?.profileStrength ?? 0;
  const recentScholarships = [...savedScholarships]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // ---- daily checklist state ----
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [newItem, setNewItem] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDaily(loadDailyState());
  }, []);

  function updateDaily(update: Partial<DailyState>) {
    setDaily((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...update };
      saveDailyState(next);
      return next;
    });
  }

  function addItem() {
    if (!newItem.trim() || !daily) return;
    const item: DailyItem = { id: Date.now().toString(), text: newItem.trim(), done: false };
    updateDaily({ items: [...daily.items, item] });
    setNewItem("");
    newItemRef.current?.focus();
  }

  function toggleItem(id: string) {
    if (!daily) return;
    const items = daily.items.map((item) => item.id === id ? { ...item, done: !item.done } : item);
    const doneNow = items.filter((i) => i.done).length;
    let streak = daily.streak;
    let lastCompletedDate = daily.lastCompletedDate;
    if (doneNow >= daily.goal && lastCompletedDate !== getTodayKey()) {
      streak = daily.streak + 1;
      lastCompletedDate = getTodayKey();
    }
    updateDaily({ items, streak, lastCompletedDate });
  }

  function removeItem(id: string) {
    if (!daily) return;
    updateDaily({ items: daily.items.filter((i) => i.id !== id) });
  }

  function adjustGoal(delta: number) {
    if (!daily) return;
    const g = Math.max(1, Math.min(20, daily.goal + delta));
    updateDaily({ goal: g });
  }

  const doneCount = daily?.items.filter((i) => i.done).length ?? 0;
  const goalMet = daily ? doneCount >= daily.goal : false;
  const progressPct = daily ? Math.min(100, Math.round((doneCount / daily.goal) * 100)) : 0;

  // ---- tip rotation ----
  const tips = [
    "Local and state scholarships usually draw a far smaller applicant pool than national ones. Check your community foundation and your state's aid program.",
    "The more scholarships you apply to, the better your odds — volume matters. Set a daily goal below and keep the streak alive.",
    "Submit early. Rushed, last-minute applications are where avoidable mistakes happen.",
    "Reuse essays across multiple scholarships. One strong story, lightly adapted, can serve many applications.",
    "Complete your eligibility profile — state, income, first-gen status — so you only see scholarships you actually qualify for.",
  ];
  const tipIndex = new Date().getDate() % tips.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Your scholarship command center — let's get to work.</p>
      </div>

      {/* Onboarding banner */}
      {!onboardingComplete && (
        <div className="rounded-2xl p-6 gradient-brand flex items-center justify-between" style={{ boxShadow: "0 0 40px rgba(201,168,76,0.2)" }}>
          <div>
            <div className="font-bold text-lg mb-1" style={{ color: "#080808" }}>Complete your scholarship profile</div>
            <p className="text-sm" style={{ color: "rgba(8,8,8,0.65)" }}>
              Add your resume, achievements, and goals to unlock AI-powered matching.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: "#080808", color: "var(--gold)", border: "none" }}
          >
            Start now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Deadlines urgent banner */}
      {deadlinesThisWeek > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(229,80,80,0.08)", border: "1px solid rgba(229,80,80,0.25)" }}>
          <Clock className="w-5 h-5 shrink-0" style={{ color: "var(--red)" }} />
          <div className="flex-1">
            <span className="font-semibold text-sm" style={{ color: "var(--red)" }}>
              {deadlinesThisWeek} scholarship{deadlinesThisWeek > 1 ? "s" : ""} due this week
            </span>
            <span className="text-sm ml-2" style={{ color: "var(--text-2)" }}>— don't let them expire.</span>
          </div>
          <Link href="/scholarships/search" className="text-xs font-medium shrink-0 badge-red">
            View deadlines
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Potential Funding",
            value: totalDiscovered > 0 ? formatCurrency(totalDiscovered) : "—",
            icon: TrendingUp,
            iconColor: "var(--gold)",
            iconBg: "rgba(201,168,76,0.12)",
            valueColor: "var(--gold-light)",
            sub: `${savedScholarships.length} saved`,
          },
          {
            label: "Awards Won",
            value: totalWon > 0 ? formatCurrency(totalWon) : "—",
            icon: Trophy,
            iconColor: "var(--gold-bright)",
            iconBg: "rgba(240,216,144,0.12)",
            valueColor: "var(--gold-bright)",
            sub: `${savedScholarships.filter((s) => s.status === "WON").length} scholarships`,
          },
          {
            label: "Applications",
            value: `${submitted}`,
            icon: CheckCircle2,
            iconColor: "var(--green)",
            iconBg: "rgba(32,200,120,0.12)",
            valueColor: "var(--green)",
            sub: `${inProgress} in progress`,
          },
          {
            label: "Due This Week",
            value: deadlinesThisWeek.toString(),
            icon: Clock,
            iconColor: deadlinesThisWeek > 0 ? "var(--red)" : "var(--text-3)",
            iconBg: deadlinesThisWeek > 0 ? "rgba(229,80,80,0.12)" : "rgba(255,255,255,0.03)",
            valueColor: deadlinesThisWeek > 0 ? "var(--red)" : "var(--text-2)",
            sub: "deadlines",
          },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "0.75rem", background: stat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <stat.icon style={{ width: 16, height: 16, color: stat.iconColor }} />
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.valueColor, marginBottom: "0.125rem" }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{stat.sub}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500, marginTop: "0.25rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scholarships list */}
        <div className="lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem" }}>
          <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Saved Scholarships</h2>
            <Link href="/scholarships/paste" className="text-xs font-medium flex items-center gap-1" style={{ color: "var(--gold)" }}>
              Add scholarship <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentScholarships.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--border-2)" }} />
              <p className="font-medium text-sm mb-1" style={{ color: "var(--text-2)" }}>No scholarships saved yet</p>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--text-3)" }}>
                Paste any scholarship description to get started
              </p>
              <Link href="/scholarships/paste" className="btn-gold inline-flex items-center gap-2 text-sm">
                Paste a scholarship
              </Link>
            </div>
          ) : (
            <div>
              {recentScholarships.map((saved) => {
                const s = STATUS_STYLE[saved.status];
                return (
                  <div key={saved.id} className="p-5 transition-colors" style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>
                          {saved.scholarship.name}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                          {saved.scholarship.organization}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm" style={{ color: "var(--green)" }}>
                          {saved.scholarship.amountText}
                        </div>
                        {saved.deadline && (
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                            {formatDeadline(saved.deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {s.label}
                      </span>
                      {saved.matchScore && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(201,168,76,0.10)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.2)" }}>
                          {saved.matchScore.total}% match
                        </span>
                      )}
                      {saved.roiScore && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
                          ROI {saved.roiScore.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          {/* Profile strength */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Profile Strength</h2>
              <Link href="/profile" className="text-xs font-medium" style={{ color: "var(--gold)" }}>
                Improve →
              </Link>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <div className="text-4xl font-bold text-gradient">{profileStrength}%</div>
              <div className="text-xs mb-1" style={{ color: "var(--text-3)" }}>
                {profileStrength < 40 ? "Getting started" : profileStrength < 70 ? "Good progress" : profileStrength < 90 ? "Strong profile" : "Elite"}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
              <div className="h-full rounded-full transition-all duration-700 gradient-brand" style={{ width: `${profileStrength}%` }} />
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: "Resume uploaded", done: !!profile?.achievements?.length },
                { label: "Stories extracted", done: (profile?.stories?.length ?? 0) > 0 },
                { label: "Career goals set", done: !!profile?.longTermGoals },
                { label: "GPA added", done: !!profile?.gpa },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.done
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--green)" }} />
                    : <div className="w-3.5 h-3.5 rounded-full" style={{ border: "1px solid var(--border-2)" }} />}
                  <span style={{ color: item.done ? "var(--text-2)" : "var(--text-3)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Quick Actions</h2>
            <div className="space-y-1">
              {[
                { href: "/scholarships/search", icon: Search, label: "Find Scholarships", iconColor: "var(--gold)", iconBg: "rgba(201,168,76,0.12)" },
                { href: "/scholarships/paste", icon: FileText, label: "Paste & Analyze", iconColor: "#C084FC", iconBg: "rgba(168,85,247,0.12)" },
                { href: "/stories", icon: BookOpen, label: "Story Vault", iconColor: "var(--green)", iconBg: "rgba(32,200,120,0.12)" },
                { href: "/generate", icon: Sparkles, label: "Write an Essay", iconColor: "var(--gold)", iconBg: "rgba(201,168,76,0.12)" },
                { href: "/gap-analysis", icon: Zap, label: "Run Gap Analysis", iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.12)" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-colors group"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 28, height: 28, borderRadius: "0.5rem", background: action.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <action.icon style={{ width: 14, height: 14, color: action.iconColor }} />
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{action.label}</span>
                  <ArrowRight className="w-3 h-3 ml-auto" style={{ color: "var(--text-3)" }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Tip card */}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4" style={{ color: "var(--gold)" }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gold-dark)" }}>Pro Tip</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{tips[tipIndex]}</p>
          </div>
        </div>
      </div>

      {/* Daily Checklist */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.25)", background: "var(--surface)" }}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", background: "linear-gradient(90deg, rgba(201,168,76,0.06), transparent)" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: "0.75rem", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target className="w-4 h-4" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: "var(--text)" }}>Today's Application Goal</h2>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          {/* Streak badge */}
          {(daily?.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Flame className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
              <span className="text-xs font-bold" style={{ color: "var(--gold)" }}>{daily?.streak} day streak</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Goal setter */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium mb-2" style={{ color: "var(--text-2)" }}>
                How many scholarships will you apply to today?
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustGoal(-1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-dark)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gradient">{daily?.goal ?? 3}</div>
                  <div className="text-xs" style={{ color: "var(--text-3)" }}>applications</div>
                </div>
                <button
                  onClick={() => adjustGoal(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-dark)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress ring / summary */}
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: "var(--text-3)" }}>Progress</span>
                <span style={{ color: goalMet ? "var(--green)" : "var(--gold)" }} className="font-semibold">
                  {doneCount} / {daily?.goal ?? 3}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: goalMet ? "var(--green)" : "linear-gradient(90deg, var(--gold-dark), var(--gold-light))" }}
                />
              </div>
              {goalMet && (
                <div className="mt-2 text-xs font-semibold" style={{ color: "var(--green)" }}>
                  Goal complete! Exceptional work.
                </div>
              )}
            </div>
          </div>

          {/* Checklist items */}
          {(daily?.items.length ?? 0) > 0 && (
            <div className="space-y-2">
              {daily?.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors group" style={{ background: item.done ? "rgba(32,200,120,0.06)" : "var(--surface-2)", border: `1px solid ${item.done ? "rgba(32,200,120,0.2)" : "var(--border)"}` }}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="shrink-0 transition-colors"
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: item.done ? "var(--green)" : "transparent",
                      border: `2px solid ${item.done ? "var(--green)" : "var(--border-2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {item.done && <CheckCircle2 className="w-3 h-3" style={{ color: "#080808" }} />}
                  </button>
                  <span className="flex-1 text-sm" style={{ color: item.done ? "var(--text-3)" : "var(--text)", textDecoration: item.done ? "line-through" : "none" }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add item */}
          <div className="flex gap-2">
            <input
              ref={newItemRef}
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder='Add a scholarship to apply to today, e.g. "Gates Scholarship"'
              className="input-dark flex-1 text-sm"
            />
            <button onClick={addItem} className="btn-gold flex items-center gap-1.5 text-sm shrink-0">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Motivational tip based on progress */}
          {(daily?.items.length ?? 0) === 0 && (
            <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
              Add scholarships to your list above and check them off as you apply. Build the habit — one day at a time.
            </p>
          )}
          {!goalMet && (daily?.items.length ?? 0) > 0 && doneCount > 0 && (
            <p className="text-xs text-center" style={{ color: "var(--text-2)" }}>
              {daily!.goal - doneCount} more to hit your goal. You&apos;re {progressPct}% there — keep going.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
