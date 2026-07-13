"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import {
 BookOpen,
 Sparkles,
 Loader2,
 ChevronDown,
 ChevronUp,
 AlertCircle,
 HelpCircle,
 Plus,
} from "lucide-react";
import type { Story, StoryCategory } from "@/lib/types";

const CATEGORY_STYLES: Record<StoryCategory, { bg: string; color: string }> = {
 CHALLENGE: { bg: "rgba(229,80,80,0.12)", color: "#FC7878" },
 LEADERSHIP: { bg: "rgba(96,165,250,0.12)", color: "#93C5FD" },
 COMMUNITY_SERVICE: { bg: "rgba(32,200,120,0.12)", color: "#6EE7B7" },
 FAMILY_RESPONSIBILITY:{ bg: "rgba(251,146,60,0.12)", color: "#FCA26C" },
 ACADEMIC_GROWTH: { bg: "rgba(167,139,250,0.12)", color: "#C4B5FD" },
 FAILURE_RECOVERY: { bg: "rgba(234,179,8,0.12)", color: "#FDE047" },
 CULTURAL_TRANSITION: { bg: "rgba(244,114,182,0.12)", color: "#F9A8D4" },
 FINANCIAL_HARDSHIP: { bg: "rgba(255, 255, 255,0.15)", color: "var(--gold)" },
 FIRST_GENERATION: { bg: "rgba(34,211,238,0.12)", color: "#67E8F9" },
 RESEARCH: { bg: "rgba(99,102,241,0.12)", color: "#A5B4FC" },
 CAREER_DISCOVERY: { bg: "rgba(20,184,166,0.12)", color: "#5EEAD4" },
 ATHLETIC: { bg: "rgba(132,204,22,0.12)", color: "#BEF264" },
 CREATIVE: { bg: "rgba(244,63,94,0.12)", color: "#FDA4AF" },
 ENTREPRENEURSHIP: { bg: "rgba(251,146,60,0.12)", color: "#FCA26C" },
 MORAL_COURAGE: { bg: "rgba(168,85,247,0.12)", color: "#D8B4FE" },
 IDENTITY_BELONGING: { bg: "rgba(232,121,249,0.12)", color: "#F0ABFC" },
 SERVICE: { bg: "rgba(16,185,129,0.12)", color: "#6EE7B7" },
 MENTORSHIP: { bg: "rgba(14,165,233,0.12)", color: "#7DD3FC" },
 WORK_ETHIC: { bg: "rgba(255,255,255,0.06)", color: "var(--text-2)" },
 RESILIENCE: { bg: "rgba(229,80,80,0.12)", color: "#FC7878" },
};

const CATEGORY_LABELS: Record<StoryCategory, string> = {
 CHALLENGE: "Challenge",
 LEADERSHIP: "Leadership",
 COMMUNITY_SERVICE: "Community Service",
 FAMILY_RESPONSIBILITY: "Family Responsibility",
 ACADEMIC_GROWTH: "Academic Growth",
 FAILURE_RECOVERY: "Failure & Recovery",
 CULTURAL_TRANSITION: "Cultural Transition",
 FINANCIAL_HARDSHIP: "Financial Hardship",
 FIRST_GENERATION: "First Generation",
 RESEARCH: "Research",
 CAREER_DISCOVERY: "Career Discovery",
 ATHLETIC: "Athletic",
 CREATIVE: "Creative",
 ENTREPRENEURSHIP: "Entrepreneurship",
 MORAL_COURAGE: "Moral Courage",
 IDENTITY_BELONGING: "Identity & Belonging",
 SERVICE: "Service",
 MENTORSHIP: "Mentorship",
 WORK_ETHIC: "Work Ethic",
 RESILIENCE: "Resilience",
};

function StoryCard({ story }: { story: Story }) {
 const [expanded, setExpanded] = useState(false);
 const style = CATEGORY_STYLES[story.category] ?? { bg: "rgba(255,255,255,0.06)", color: "var(--text-2)" };

 return (
 <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <div className="p-5">
 <div className="flex items-start justify-between gap-3 mb-3">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>
 {CATEGORY_LABELS[story.category]}
 </span>
 </div>
 <h3 className="font-semibold" style={{ color: "var(--text)" }}>{story.title}</h3>
 </div>
 </div>

 <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>{story.summary}</p>

 {story.riskNotes && (
 <div className="flex items-start gap-2 rounded-xl p-3 mb-3" style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.2)" }}>
 <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
 <p className="text-xs" style={{ color: "#F59E0B" }}>{story.riskNotes}</p>
 </div>
 )}

 <div className="flex flex-wrap gap-1.5 mb-3">
 {story.bestUseCases.map((use) => (
 <span key={use} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255, 255, 255,0.10)", color: "var(--gold-dark)", border: "1px solid rgba(255, 255, 255,0.2)" }}>
 {use}
 </span>
 ))}
 </div>

 <button
 onClick={() => setExpanded(!expanded)}
 className="flex items-center gap-1 text-xs font-medium transition-colors"
 style={{ color: "var(--gold)" }}
 onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold-light)")}
 onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
 >
 {expanded ? "Show less" : "See full story structure"}
 {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
 </button>
 </div>

 {expanded && (
 <div className="px-5 pb-5 pt-4 space-y-3" style={{ borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}>
 {[
 { label: "Emotional core", value: story.emotionalCore },
 { label: "Conflict", value: story.conflict },
 { label: "Turning point", value: story.turningPoint },
 { label: "Outcome", value: story.outcome },
 { label: "Lesson", value: story.lesson },
 ].map(
 (item) =>
 item.value && (
 <div key={item.label}>
 <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>
 {item.label}
 </div>
 <p className="text-sm" style={{ color: "var(--text-2)" }}>{item.value}</p>
 </div>
 )
 )}

 {story.followUpQuestions.length > 0 && (
 <div>
 <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>
 Questions to strengthen this story
 </div>
 {story.followUpQuestions.map((q) => (
 <div key={q} className="flex items-start gap-2 mb-1.5">
 <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--gold-dark)" }} />
 <p className="text-xs" style={{ color: "var(--text-2)" }}>{q}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 );
}

export default function StoryVaultPage() {
 const { profile, user, updateProfile } = useAppStore();
 const [extracting, setExtracting] = useState(false);

 const stories = profile?.stories ?? [];

 async function handleExtract() {
 if (!profile) { toast.error("Complete your profile first to extract stories."); return; }
 if (profile.achievements.length === 0) { toast.error("Add some achievements to your profile first, stories are extracted from your real experiences."); return; }
 setExtracting(true);
 try {
 const res = await fetch("/api/ai/extract-stories", {
 method: "POST",
 headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
 body: JSON.stringify({ profile }),
 });
 if (!res.ok) throw new Error(await res.text());
 const newStories = await res.json();
 updateProfile({ stories: [...(profile.stories ?? []), ...newStories] });
 toast.success(`${newStories.length} stories extracted from your profile!`);
 } catch {
 toast.error("Could not extract stories. Try again in a moment.");
 } finally {
 setExtracting(false);
 }
 }

 return (
 <div className="max-w-5xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Story Vault</h1>
 <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
 Your experiences as reusable narrative assets, ready for any scholarship essay.
 </p>
 </div>
 <button onClick={handleExtract} disabled={extracting} className="btn-gold flex items-center gap-2 text-sm">
 {extracting
 ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
 : <><Sparkles className="w-4 h-4" /> Extract Stories with AI</>}
 </button>
 </div>

 {stories.length === 0 ? (
 <div className="py-20 text-center rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--border-2)" }} />
 <p className="font-semibold mb-1" style={{ color: "var(--text-2)" }}>No stories yet</p>
 <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-3)" }}>
 Stories are extracted from your profile achievements and experiences.
 {!profile?.achievements?.length
 ? " Add achievements to your profile first."
 : " Click \"Extract Stories\" to get started."}
 </p>
 {!profile?.achievements?.length ? (
 <a href="/profile" className="btn-gold inline-flex items-center gap-2 text-sm">
 Build my profile first
 </a>
 ) : (
 <button onClick={handleExtract} disabled={extracting} className="btn-gold inline-flex items-center gap-2 text-sm">
 {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
 Extract Stories with AI
 </button>
 )}
 </div>
 ) : (
 <>
 {/* Stats */}
 <div className="grid grid-cols-3 gap-4">
 {[
 { value: stories.length, label: "Stories in vault", color: "var(--gold)" },
 { value: new Set(stories.map((s) => s.category)).size, label: "Story categories", color: "var(--gold-light)" },
 { value: stories.filter((s) => !s.riskNotes).length, label: "Essay-ready", color: "var(--green)" },
 ].map((stat) => (
 <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
 <div className="text-xs" style={{ color: "var(--text-3)" }}>{stat.label}</div>
 </div>
 ))}
 </div>

 {/* Stories grid */}
 <div className="grid md:grid-cols-2 gap-4">
 {stories.map((story) => (
 <StoryCard key={story.id} story={story} />
 ))}
 </div>

 {/* Re-extract */}
 <div className="flex justify-center">
 <button onClick={handleExtract} disabled={extracting} className="btn-ghost flex items-center gap-2 text-sm">
 {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
 Extract more stories
 </button>
 </div>
 </>
 )}
 </div>
 );
}
