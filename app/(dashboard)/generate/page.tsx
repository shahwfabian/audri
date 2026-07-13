"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { safeApiResponse } from "@/lib/errors";
import { TonePicker } from "@/components/TonePicker";
import { DEFAULT_TONE_ID } from "@/lib/ai/tones";
import { toast } from "sonner";
import {
 Sparkles,
 Loader2,
 Copy,
 Save,
 RefreshCw,
 Clock,
 Trophy,
 PenLine,
 ChevronDown,
 ShieldCheck,
 BookMarked,
 X,
} from "lucide-react";
import type { EssayDraft } from "@/lib/types";

interface AutoEssayResult {
 scholarship: {
 title: string;
 organization?: string;
 awardAmountMax?: number | null;
 awardAmountMin?: number | null;
 deadline?: string | null;
 description?: string;
 };
 essayPrompt: string;
 wordLimit: number | null;
 allPrompts: { prompt: string; wordLimit: number | null }[];
 strategy: { strategy: string; oneSentencePoint?: string };
 essay: string;
 funderResearched?: boolean;
 sourceUrl?: string | null;
 quota?: { plan: "free" | "pro"; remaining: number | null };
}

const LOADING_STAGES = [
 "Reading every word you pasted…",
 "Extracting the prompt, deadline, and what the judges value…",
 "Digging through your profile for the story only YOU can tell…",
 "Running the “but why?” chain…",
 "Writing your essay, scene first, show don't tell…",
];

const LOADING_STAGES_URL = [
 "Visiting the scholarship's website…",
 "Researching the organization behind it, mission, values, who they champion…",
 "Extracting the prompt, deadline, and what the judges value…",
 "Aligning your real story with what this funder rewards…",
 "Writing your essay, scene first, show don't tell…",
];

export default function GeneratePage() {
 const { profile, apiKey, user, pendingStoryAngle, setPendingStoryAngle, addEssayDraft } = useAppStore();

 const [pastedText, setPastedText] = useState("");
 const [scholarshipUrl, setScholarshipUrl] = useState("");
 const [extraNotes, setExtraNotes] = useState("");
 const [toneId, setToneId] = useState<string>(DEFAULT_TONE_ID);
 const [showNotes, setShowNotes] = useState(false);
 const [generating, setGenerating] = useState(false);
 const [stage, setStage] = useState(0);
 const [result, setResult] = useState<AutoEssayResult | null>(null);
 const [saved, setSaved] = useState(false);
 const [showManualNudge, setShowManualNudge] = useState(false);
 const [paywalled, setPaywalled] = useState(false);
 const [quota, setQuota] = useState<{ plan: string; remaining: number | null } | null>(null);

 // First visit? Point them at the manual before anything else.
 useEffect(() => {
 try {
 // localStorage is an external browser system and must be read after mount.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 if (!localStorage.getItem("audri:manual-seen")) setShowManualNudge(true);
 } catch {}
 }, []);

 // A story angle chosen in Story Studio prefills the notes here.
 useEffect(() => {
 if (pendingStoryAngle) {
 // Idempotent: guard against React Strict-Mode double-invoke duplicating it.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setExtraNotes((prev) =>
 prev.includes(pendingStoryAngle) ? prev : prev ? `${prev}\n\n${pendingStoryAngle}` : pendingStoryAngle
 );
 setShowNotes(true);
 setPendingStoryAngle(null);
 toast.success("Story angle added, paste a scholarship to build on it.");
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [pendingStoryAngle]);

 function dismissManualNudge() {
 setShowManualNudge(false);
 try {
 localStorage.setItem("audri:manual-seen", "1");
 } catch {}
 }

 const authHeaders: Record<string, string> = {
 "Content-Type": "application/json",
 ...(apiKey ? { "x-audri-api-key": apiKey } : {}),
 ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
 };

 const urlMode = !!scholarshipUrl.trim() || /^https?:\/\/\S+$/i.test(pastedText.trim());
 const stages = urlMode ? LOADING_STAGES_URL : LOADING_STAGES;

 async function handleGenerate(promptOverride?: string, wordLimitOverride?: number | null) {
 if (!profile) {
 toast.error("Build your profile first, the essay has to be about YOU.");
 return;
 }
 if (!scholarshipUrl.trim() && pastedText.trim().length < 50) {
 toast.error("Paste the scholarship's link, or the whole page, so Audri has something to work with.");
 return;
 }

 setGenerating(true);
 setSaved(false);
 setStage(0);

 // advance the stage messages while we wait
 const ticker = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 6500);

 try {
 const res = await fetch("/api/ai/auto-essay", {
 method: "POST",
 headers: authHeaders,
 body: JSON.stringify({
 pastedText,
 url: scholarshipUrl.trim() || undefined,
 profile,
 stories: profile.stories ?? [],
 extraNotes,
 toneId,
 promptOverride,
 wordLimitOverride,
 }),
 });

 if (res.status === 402) {
 setPaywalled(true);
 toast.error("You've used your free essays, upgrade for unlimited.");
 return;
 }

 const { data, error } = await safeApiResponse<AutoEssayResult>(res);
 if (error || !data) {
 toast.error(error ?? "Generation failed. Try pasting more of the page.");
 return;
 }
 setResult(data);
 if (data.quota) setQuota(data.quota);
 toast.success("Your essay is ready.");
 } finally {
 clearInterval(ticker);
 setGenerating(false);
 }
 }

 function handleCopy() {
 if (!result) return;
 navigator.clipboard.writeText(result.essay);
 toast.success("Essay copied, paste it into the application.");
 }

 function handleSave() {
 if (!result) return;
 const draft: EssayDraft = {
 id: generateId("essay"),
 prompt: result.essayPrompt,
 wordLimit: result.wordLimit ?? undefined,
 content: result.essay,
 strategy: result.strategy?.strategy,
 versions: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 };
 addEssayDraft(draft);
 setSaved(true);
 toast.success("Saved to your Essays.");
 }

 const wordCount = result ? result.essay.trim().split(/\s+/).length : 0;

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 {/* Hero */}
 <div className="text-center pt-2 pb-1">
 <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
 Paste the scholarship. <span className="text-gradient">Get the essay.</span>
 </h1>
 <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
 Copy the entire scholarship page, A to Z, don&apos;t clean it up, and paste it below.
 Audri finds the prompt, studies what the judges want, and writes your essay from your real story.
 </p>
 </div>

 {showManualNudge && (
 <div className="rounded-2xl p-4 flex flex-wrap items-center gap-3" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <BookMarked className="w-5 h-5 shrink-0" style={{ color: "var(--gold)" }} />
 <p className="text-sm flex-1 min-w-[240px]" style={{ color: "var(--gold-light)" }}>
 <span className="font-semibold">First time here?</span> Read the manual, six steps, sixty seconds, and you&apos;ll know exactly how to win with Audri.
 </p>
 <Link href="/manual" className="btn-gold text-sm px-4 py-2 shrink-0">Open the Manual</Link>
 <button onClick={dismissManualNudge} aria-label="Dismiss" className="shrink-0 transition-colors" style={{ color: "var(--text-3)" }}
 onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
 onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {!profile && (
 <div className="rounded-2xl p-4 flex items-center justify-between gap-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <p className="text-sm" style={{ color: "var(--gold-light)" }}>
 Your essay can only be as real as your profile. Build it once, every essay after that is instant.
 </p>
 <Link href="/onboarding" className="btn-gold text-sm px-4 py-2 shrink-0">Build my profile</Link>
 </div>
 )}

 {/* The paste box */}
 <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 {/* Link lane, the fastest path */}
 <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
 Paste the scholarship&apos;s link
 </label>
 <input
 type="url"
 value={scholarshipUrl}
 onChange={(e) => setScholarshipUrl(e.target.value)}
 placeholder="https://www.example.org/our-scholarship, Audri reads the page AND researches the organization behind it"
 className="input-dark w-full text-sm"
 />
 {scholarshipUrl.trim() && (
 <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--gold-light)" }}>
 <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
 Audri will study this organization&apos;s mission and background, then align your essay to what they reward.
 </p>
 )}

 <div className="flex items-center gap-3 my-5">
 <div className="flex-1 gold-line" />
 <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>or paste the page itself</span>
 <div className="flex-1 gold-line" />
 </div>

 <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
 The entire scholarship page
 </label>
 <textarea
 value={pastedText}
 onChange={(e) => setPastedText(e.target.value)}
 rows={12}
 placeholder={`Select everything on the scholarship's website (Ctrl+A, Ctrl+C) and paste it here (Ctrl+V).\n\nName, sponsor, award amount, deadline, eligibility, essay prompt, judging criteria, even the navigation junk, paste it ALL. The AI sorts it out.`}
 className="input-dark w-full resize-none font-mono text-sm"
 style={{ lineHeight: 1.6 }}
 />

 {/* Optional notes */}
 <button
 onClick={() => setShowNotes(!showNotes)}
 className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors"
 style={{ color: "var(--text-2)" }}
 >
 <PenLine className="w-3.5 h-3.5" />
 Anything specific you want in this essay? (optional)
 <ChevronDown className="w-3.5 h-3.5" style={{ transform: showNotes ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
 </button>
 {showNotes && (
 <textarea
 value={extraNotes}
 onChange={(e) => setExtraNotes(e.target.value)}
 rows={3}
 placeholder="A memory, a person, a detail you want woven in, anything you'd tell a friend who was helping you write this."
 className="input-dark w-full resize-none text-sm mt-2"
 />
 )}

 {/* Voice & tone */}
 <div className="mt-5">
 <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
 Voice &amp; tone
 </label>
 <TonePicker value={toneId} onChange={setToneId} />
 </div>

 <div className="flex items-center justify-between mt-5">
 <p className="text-xs" style={{ color: "var(--text-3)" }}>
 {scholarshipUrl.trim()
 ? "Link ready, Audri will fetch and research it"
 : pastedText.length > 0
 ? `${pastedText.trim().split(/\s+/).length.toLocaleString()} words pasted`
 : "Nothing pasted yet"}
 </p>
 <button
 onClick={() => handleGenerate()}
 disabled={generating || (!pastedText.trim() && !scholarshipUrl.trim())}
 className="btn-gold flex items-center gap-2 px-6 py-3 text-sm font-bold disabled:opacity-50"
 >
 {generating ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Writing…</>
 ) : (
 <><Sparkles className="w-4 h-4" /> Write My Essay</>
 )}
 </button>
 </div>

 {generating && (
 <div className="mt-4 rounded-xl p-4 flex items-center gap-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
 <div className="w-4 h-4 border-2 rounded-full animate-spin shrink-0" style={{ borderColor: "var(--border-2)", borderTopColor: "var(--gold)" }} />
 <span className="text-sm shimmer-gold" style={{ color: "var(--gold-light)" }}>{stages[stage]}</span>
 </div>
 )}

 {quota && !generating && (
 <p className="text-xs mt-3 text-right" style={{ color: quota.remaining !== null && quota.remaining <= 1 ? "var(--gold)" : "var(--text-3)" }}>
 {quota.remaining === null
 ? "Audri Pro, unlimited essays"
 : `${quota.remaining} free ${quota.remaining === 1 ? "essay" : "essays"} left · `}
 {quota.remaining !== null && (
 <Link href="/upgrade" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>Go unlimited</Link>
 )}
 </p>
 )}
 </div>

 {/* Paywall */}
 {paywalled && !generating && (
 <div className="rounded-2xl p-8 text-center" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", boxShadow: "0 0 60px var(--gold-10)" }}>
 <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
 You&apos;ve used your free essays, <span className="text-gradient">and that&apos;s a good sign.</span>
 </h2>
 <p className="text-sm max-w-md mx-auto mb-5" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
 You&apos;re applying. That already puts you ahead of most students. Go unlimited and keep
 the momentum, one win pays for years of Audri Pro.
 </p>
 <Link href="/upgrade" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold glow-pulse">
 <Sparkles className="w-4 h-4" /> Upgrade to Audri Pro, $9/mo
 </Link>
 </div>
 )}

 {/* Result */}
 {result && !generating && (
 <div className="space-y-4">
 {/* Parsed scholarship summary */}
 <div className="rounded-2xl p-5 flex flex-wrap items-center gap-x-6 gap-y-2" style={{ background: "var(--surface)", border: "1px solid var(--gold-25)" }}>
 <div className="flex items-center gap-2">
 <Trophy className="w-4 h-4" style={{ color: "var(--gold)" }} />
 <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{result.scholarship.title}</span>
 </div>
 {result.scholarship.awardAmountMax ? (
 <span className="text-sm font-bold" style={{ color: "var(--green)" }}>
 ${result.scholarship.awardAmountMax.toLocaleString()}
 </span>
 ) : null}
 {result.scholarship.deadline && (
 <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}>
 <Clock className="w-3 h-3" /> Due {result.scholarship.deadline}
 </span>
 )}
 <span className="text-xs flex items-center gap-1 ml-auto" style={{ color: "var(--text-3)" }}>
 <ShieldCheck className="w-3 h-3" style={{ color: "var(--gold)" }} />
 Built from your real profile, nothing invented
 </span>
 {result.funderResearched && (
 <span className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold-light)" }}>
 <Sparkles className="w-3 h-3" style={{ color: "var(--gold)" }} />
 Funder researched, essay aligned to their mission
 </span>
 )}
 </div>

 {/* Prompt it answered */}
 <div className="rounded-2xl p-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>Prompt detected</div>
 <p className="text-sm" style={{ color: "var(--text)" }}>{result.essayPrompt}</p>
 {result.allPrompts.length > 1 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {result.allPrompts.map((p, i) => (
 <button
 key={i}
 onClick={() => handleGenerate(p.prompt, p.wordLimit)}
 className="text-xs px-3 py-1.5 rounded-lg transition-colors"
 style={{
 background: p.prompt === result.essayPrompt ? "var(--gold)" : "var(--surface-2)",
 color: p.prompt === result.essayPrompt ? "#080808" : "var(--text-2)",
 border: "1px solid var(--border-2)",
 }}
 >
 Prompt {i + 1}{p.wordLimit ? ` · ${p.wordLimit}w` : ""}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* The essay */}
 <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
 <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
 Your essay · {wordCount} words{result.wordLimit ? ` / ${result.wordLimit} limit` : ""}
 </span>
 <div className="flex items-center gap-2">
 <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2">
 <Copy className="w-3.5 h-3.5" /> Copy
 </button>
 <button
 onClick={handleSave}
 disabled={saved}
 className="btn-gold flex items-center gap-1.5 text-xs px-3 py-2 disabled:opacity-60"
 >
 <Save className="w-3.5 h-3.5" /> {saved ? "Saved" : "Save to Essays"}
 </button>
 <button
 onClick={() => handleGenerate(result.essayPrompt, result.wordLimit)}
 className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2"
 >
 <RefreshCw className="w-3.5 h-3.5" /> Rewrite
 </button>
 </div>
 </div>
 <div className="px-8 py-7">
 {result.essay.split(/\n{2,}/).map((para, i) => (
 <p
 key={i}
 className="text-[15px] mb-4 last:mb-0"
 style={{ color: "var(--text)", lineHeight: 1.85, fontFamily: "Georgia, 'Times New Roman', serif" }}
 >
 {para}
 </p>
 ))}
 </div>
 </div>

 {/* Why this works */}
 {result.strategy?.strategy && (
 <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>Why this essay works</div>
 <p className="text-sm" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{result.strategy.strategy}</p>
 </div>
 )}
 </div>
 )}
 </div>
 );
}
