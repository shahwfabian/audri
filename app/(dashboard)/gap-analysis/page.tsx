"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { scoreToColor } from "@/lib/utils";
import {
  Zap,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Target,
  BarChart3,
} from "lucide-react";
import type { ProfileGap, GapSeverity } from "@/lib/types";

const SEVERITY_CONFIG: Record<GapSeverity, {
  icon: typeof AlertTriangle;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  CRITICAL: { icon: AlertTriangle, color: "#FC7878",      bg: "rgba(229,80,80,0.10)",   border: "rgba(229,80,80,0.25)",   label: "Critical" },
  HIGH:     { icon: AlertCircle,   color: "#FCA26C",      bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.25)",  label: "High Priority" },
  MEDIUM:   { icon: Info,          color: "#FDE047",      bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.25)",   label: "Medium" },
  LOW:      { icon: CheckCircle2,  color: "var(--green)", bg: "rgba(32,200,120,0.10)",  border: "rgba(32,200,120,0.25)",  label: "Low" },
};

function GapCard({ gap }: { gap: ProfileGap }) {
  const [expanded, setExpanded] = useState(false);
  const c = SEVERITY_CONFIG[gap.severity];

  return (
    <div className="rounded-2xl p-5" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${c.border}` }}>
          <c.icon className="w-4 h-4" style={{ color: c.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold" style={{ color: c.color }}>{c.label}</span>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>{gap.category}</span>
          </div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{gap.title}</h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>{gap.whyItMatters}</p>

      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>Quick fix</div>
          <p className="text-xs" style={{ color: "var(--text-2)" }}>{gap.quickFix}</p>
        </div>
        <div className="flex-1 rounded-xl p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>Long-term fix</div>
          <p className="text-xs" style={{ color: "var(--text-2)" }}>{gap.longTermFix}</p>
        </div>
      </div>

      {gap.actionPlan?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-medium hover:underline"
            style={{ color: c.color }}
          >
            {expanded ? "Hide action plan" : "See action plan →"}
          </button>
          {expanded && (
            <div className="mt-3 space-y-1.5">
              {gap.actionPlan.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                  <span className="font-bold shrink-0" style={{ color: c.color }}>{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GapAnalysisPage() {
  const { profile, user, gapAnalysis, setGapAnalysis } = useAppStore();
  const [running, setRunning] = useState(false);

  async function handleRunAnalysis() {
    if (!profile) { toast.error("Complete your profile first."); return; }
    setRunning(true);
    try {
      const res = await fetch("/api/ai/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error(await res.text());
      const analysis = await res.json();
      setGapAnalysis(analysis);
      toast.success("Gap analysis complete!");
    } catch {
      toast.error("Gap analysis could not finish. Try again in a moment.");
    } finally {
      setRunning(false);
    }
  }

  const categoryScoreEntries = gapAnalysis ? Object.entries(gapAnalysis.categoryScores) : [];
  const criticalGaps = gapAnalysis?.gaps.filter((g) => g.severity === "CRITICAL") ?? [];
  const highGaps = gapAnalysis?.gaps.filter((g) => g.severity === "HIGH") ?? [];
  const mediumGaps = gapAnalysis?.gaps.filter((g) => g.severity === "MEDIUM") ?? [];
  const lowGaps = gapAnalysis?.gaps.filter((g) => g.severity === "LOW") ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Gap Analysis</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Identify exactly what&apos;s missing from your profile and how to fix it.
          </p>
        </div>
        <button onClick={handleRunAnalysis} disabled={running} className="btn-gold flex items-center gap-2 text-sm">
          {running
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            : <><Zap className="w-4 h-4" /> {gapAnalysis ? "Re-run Analysis" : "Run Analysis"}</>}
        </button>
      </div>

      {!gapAnalysis ? (
        <div className="py-20 text-center rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--border-2)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--text-2)" }}>No analysis yet</p>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-3)" }}>
            Run a gap analysis to see exactly what scholarship committees are looking for that your profile is currently missing.
          </p>
          <button onClick={handleRunAnalysis} disabled={running || !profile} className="btn-gold inline-flex items-center gap-2 text-sm">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run Gap Analysis
          </button>
          {!profile && (
            <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
              <a href="/profile" className="underline" style={{ color: "var(--gold)" }}>Complete your profile</a> to unlock gap analysis.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5 col-span-2 md:col-span-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-4xl font-bold text-gradient mb-0.5">{gapAnalysis.overallScore}</div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>Profile Score</div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
                <div className="h-full gradient-brand rounded-full" style={{ width: `${gapAnalysis.overallScore}%` }} />
              </div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: criticalGaps.length > 0 ? "1px solid rgba(229,80,80,0.3)" : "1px solid var(--border)" }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: criticalGaps.length > 0 ? "var(--red)" : "var(--text-3)" }}>
                {criticalGaps.length}
              </div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>Critical gaps</div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: "#FCA26C" }}>{highGaps.length}</div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>High priority</div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: "#FDE047" }}>{mediumGaps.length + lowGaps.length}</div>
              <div className="text-xs" style={{ color: "var(--text-3)" }}>Other gaps</div>
            </div>
          </div>

          {/* Top priorities */}
          {gapAnalysis.topPriorities?.length > 0 && (
            <div className="rounded-2xl p-5 gradient-brand" style={{ boxShadow: "0 0 30px rgba(255, 255, 255,0.15)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" style={{ color: "rgba(8,8,8,0.6)" }} />
                <span className="font-semibold text-sm" style={{ color: "#080808" }}>Your Top Priorities Right Now</span>
              </div>
              <div className="space-y-2">
                {gapAnalysis.topPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: "rgba(8,8,8,0.2)", color: "#080808" }}>
                      {i + 1}
                    </span>
                    <p className="text-sm" style={{ color: "rgba(8,8,8,0.8)" }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category scores */}
          {categoryScoreEntries.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
                <BarChart3 className="w-4 h-4" style={{ color: "var(--gold)" }} />
                Category Breakdown
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {categoryScoreEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize" style={{ color: "var(--text-3)" }}>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={`font-semibold ${scoreToColor(value as number)}`}>{value as number}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${value}%`,
                          background: (value as number) >= 70 ? "var(--green)" : (value as number) >= 40 ? "#F59E0B" : "var(--red)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps by severity */}
          {criticalGaps.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--red)" }}>Critical Gaps</h2>
              <div className="space-y-3">{criticalGaps.map((g) => <GapCard key={g.id} gap={g} />)}</div>
            </div>
          )}
          {highGaps.length > 0 && (
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "#FCA26C" }}>High Priority</h2>
              <div className="space-y-3">{highGaps.map((g) => <GapCard key={g.id} gap={g} />)}</div>
            </div>
          )}
          {(mediumGaps.length > 0 || lowGaps.length > 0) && (
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-2)" }}>Other Areas to Improve</h2>
              <div className="space-y-3">
                {[...mediumGaps, ...lowGaps].map((g) => <GapCard key={g.id} gap={g} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
