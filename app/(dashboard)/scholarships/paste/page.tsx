"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { generateId, formatDeadline, scoreToColor, probabilityLabel, probabilityToColor } from "@/lib/utils";
import { safeApiResponse } from "@/lib/errors";
import { toast } from "sonner";
import {
 Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink,
 BookmarkPlus, Sparkles, Info, ChevronDown, ChevronUp,
 Key, FileText,
} from "lucide-react";
import type { Scholarship, SavedScholarship, ParsedScholarship } from "@/lib/types";
import Link from "next/link";

type MatchResponse = Pick<SavedScholarship, "matchScore" | "probabilityScore" | "roiScore"> & {
 applicationChecklist?: string[];
};

export default function PasteScholarshipPage() {
 const { profile, apiKey, user, addScholarship } = useAppStore();

 const [rawText, setRawText] = useState("");
 const [parsing, setParsing] = useState(false);
 const [scoring, setScoring] = useState(false);
 const [parsed, setParsed] = useState<Scholarship | null>(null);
 const [savedData, setSavedData] = useState<SavedScholarship | null>(null);
 const [parseError, setParseError] = useState<string | null>(null);
 const [showEligibility, setShowEligibility] = useState(false);
 const [showPrompts, setShowPrompts] = useState(false);

 const authHeaders: Record<string, string> = {
 "Content-Type": "application/json",
 ...(apiKey ? { "x-audri-api-key": apiKey } : {}),
 ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
 };

 async function handleParse() {
 if (!rawText.trim()) { toast.error("Please paste a scholarship description first."); return; }
 if (rawText.trim().length < 50) { toast.error("Paste more text, we need the full scholarship description."); return; }

 setParsing(true);
 setParsed(null);
 setSavedData(null);
 setParseError(null);

 const fetchRes = await fetch("/api/ai/parse-scholarship", {
 method: "POST",
 headers: authHeaders,
 body: JSON.stringify({ text: rawText }),
 });

 const { data, error } = await safeApiResponse<ParsedScholarship>(fetchRes);

 if (error || !data) {
 setParsing(false);
 setParseError(error ?? "Could not parse this scholarship. Try pasting more of the original text.");
 return;
 }

 const scholarship: Scholarship = {
 id: generateId("sc"),
 tags: [],
 name: data.name || "Scholarship",
 organization: data.organization || "Unknown",
 amountText: data.amountText || "Varies",
 amount: data.amount,
 deadlineText: data.deadlineText,
 deadline: data.deadline,
 description: data.description || "",
 eligibility: data.eligibility || "",
 eligibilityRules: data.eligibilityRules,
 prompts: data.prompts || [],
 requirements: data.requirements ?? {
 resumeRequired: false, transcriptRequired: false,
 recommendationLetters: 0, financialDocuments: false,
 portfolioRequired: false, interviewRequired: false, otherDocuments: [],
 },
 applicationUrl: data.applicationUrl,
 categories: data.categories ?? [],
 isNational: true,
 source: "PASTE",
 createdAt: new Date().toISOString(),
 };

 setParsed(scholarship);
 setParsing(false);
 toast.success("Scholarship parsed! Analyzing your match...");

 if (profile) {
 setScoring(true);
 const scoreRes = await fetch("/api/ai/calculate-match", {
 method: "POST",
 headers: authHeaders,
 body: JSON.stringify({ profile, scholarship }),
 });
 const { data: scores } = await safeApiResponse<MatchResponse>(scoreRes);
 if (scores) {
 const saved: SavedScholarship = {
 id: generateId("saved"),
 userId: profile.userId,
 scholarship,
 status: "SAVED",
 matchScore: scores.matchScore,
 probabilityScore: scores.probabilityScore,
 roiScore: scores.roiScore,
 checklist: (scores.applicationChecklist ?? []).map((label: string, i: number) => ({
 id: `chk_${i}`, label, completed: false, required: true,
 })),
 essayDrafts: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 };
 setSavedData(saved);
 }
 setScoring(false);
 }
 }

 function handleSave() {
 if (!parsed) return;
 const toSave: SavedScholarship = savedData ?? {
 id: generateId("saved"),
 userId: profile?.userId ?? "",
 scholarship: parsed,
 status: "SAVED",
 checklist: [],
 essayDrafts: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 };
 addScholarship(toSave);
 toast.success(`"${parsed.name}" saved to your dashboard!`);
 }

 const matchScore = savedData?.matchScore;
 const probScore = savedData?.probabilityScore;
 const roiScore = savedData?.roiScore;

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Paste a Scholarship</h1>
 <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
 Found a scholarship anywhere? Paste it here, Audri will parse it, check your eligibility, and score it instantly.
 </p>
 </div>

 {/* No API key warning */}
 {!apiKey && (
 <div className="rounded-2xl p-4 flex items-center justify-between gap-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
 <div className="flex items-start gap-3">
 <Key className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
 <div>
 <p className="font-semibold text-sm" style={{ color: "#F59E0B" }}>AI features require an API key</p>
 <p className="text-xs mt-0.5" style={{ color: "rgba(245,158,11,0.7)" }}>Add your Anthropic API key in Settings to parse scholarships, generate essays, and more.</p>
 </div>
 </div>
 <Link href="/settings" className="btn-gold shrink-0 text-sm">
 Go to Settings
 </Link>
 </div>
 )}

 {/* Input */}
 <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
 <label className="block text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
 Scholarship description, email, website copy, or PDF text
 </label>
 <textarea
 value={rawText}
 onChange={(e) => setRawText(e.target.value)}
 rows={10}
 placeholder={`Paste the full scholarship text here, name, award amount, eligibility requirements, essay prompts, deadline, and application link.\n\nExample:\nThe Community Foundation Scholarship\nAward: $2,500 | Deadline: March 15, 2026\n\nEligibility:\n• Resident of Fulton County, Georgia\n• Minimum GPA of 3.0\n\nEssay (500 words): Describe a challenge you have overcome...`}
 className="input-dark w-full text-sm resize-none font-mono"
 style={{ minHeight: 220 }}
 />
 <div className="flex items-center justify-between mt-3">
 <p className="text-xs" style={{ color: "var(--text-3)" }}>
 {rawText.length > 0 ? `${rawText.trim().split(/\s+/).length} words pasted` : "Paste any scholarship text, the more detail the better."}
 </p>
 <button
 onClick={handleParse}
 disabled={parsing || !rawText.trim()}
 className="btn-gold flex items-center gap-2 text-sm"
 >
 {parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze with AI</>}
 </button>
 </div>
 </div>

 {/* Error state */}
 {parseError && !parsing && (
 <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "rgba(229,80,80,0.08)", border: "1px solid rgba(229,80,80,0.25)" }}>
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
 <div>
 <p className="font-semibold text-sm" style={{ color: "var(--red)" }}>{parseError}</p>
 {parseError.includes("API key") && (
 <Link href="/settings" className="text-xs underline mt-1 inline-block" style={{ color: "rgba(229,80,80,0.7)" }}>
 Add your API key in Settings →
 </Link>
 )}
 </div>
 </div>
 )}

 {/* Results */}
 {parsed && (
 <div className="space-y-4">
 {/* Main card */}
 <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
 <div className="flex items-start justify-between gap-4 mb-4">
 <div>
 <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{parsed.name}</h2>
 <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>{parsed.organization}</p>
 </div>
 <div className="text-right shrink-0">
 <div className="text-2xl font-bold" style={{ color: "var(--green)" }}>{parsed.amountText}</div>
 {parsed.deadline && (
 <div className="text-xs mt-0.5 flex items-center justify-end gap-1" style={{ color: "var(--text-3)" }}>
 <Clock className="w-3 h-3" />{formatDeadline(parsed.deadline)}
 </div>
 )}
 </div>
 </div>

 {parsed.description && <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-2)" }}>{parsed.description}</p>}

 <div className="flex flex-wrap gap-2">
 {parsed.categories.map((cat) => (
 <span key={cat} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(255, 255, 255,0.10)", color: "var(--gold-dark)", border: "1px solid rgba(255, 255, 255,0.2)" }}>{cat}</span>
 ))}
 </div>

 {/* Scoring */}
 {scoring && (
 <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--gold)" }}>
 <Loader2 className="w-4 h-4 animate-spin" /> Calculating match score…
 </div>
 )}
 {matchScore && !scoring && (
 <div className="mt-4 grid grid-cols-3 gap-3">
 <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
 <div className={`text-3xl font-bold ${scoreToColor(matchScore.total)}`}>{matchScore.total}%</div>
 <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-3)" }}>Match Score</div>
 </div>
 <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
 <div className={`text-xl font-bold ${probabilityToColor(probScore?.level ?? "UNKNOWN")}`}>{probabilityLabel(probScore?.level ?? "UNKNOWN")}</div>
 <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-3)" }}>Probability</div>
 </div>
 <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
 <div className={`text-3xl font-bold ${scoreToColor(roiScore?.score ?? 0)}`}>{roiScore?.score ?? ", "}</div>
 <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-3)" }}>ROI Score</div>
 </div>
 </div>
 )}
 {!profile && !scoring && (
 <div className="mt-4 rounded-xl p-3 flex items-center gap-2 text-sm" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
 <Info className="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />
 <span style={{ color: "#F59E0B" }}><Link href="/profile" className="font-medium underline">Complete your profile</Link> to see your match score and probability.</span>
 </div>
 )}
 </div>

 {/* Eligibility accordion */}
 <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <button
 onClick={() => setShowEligibility(!showEligibility)}
 className="w-full flex items-center justify-between p-5 transition-colors"
 onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
 onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
 >
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4" style={{ color: "var(--green)" }} />
 <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Eligibility Requirements</span>
 </div>
 {showEligibility ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-3)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-3)" }} />}
 </button>
 {showEligibility && (
 <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
 <p className="text-sm leading-relaxed pt-4" style={{ color: "var(--text-2)" }}>
 {typeof parsed.eligibility === "string" ? parsed.eligibility : JSON.stringify(parsed.eligibility)}
 </p>
 </div>
 )}
 </div>

 {/* Essay prompts accordion */}
 {parsed.prompts.length > 0 && (
 <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <button
 onClick={() => setShowPrompts(!showPrompts)}
 className="w-full flex items-center justify-between p-5 transition-colors"
 onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
 onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
 >
 <div className="flex items-center gap-2">
 <FileText className="w-4 h-4" style={{ color: "var(--gold)" }} />
 <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Essay Prompts ({parsed.prompts.length})</span>
 </div>
 {showPrompts ? <ChevronUp className="w-4 h-4" style={{ color: "var(--text-3)" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "var(--text-3)" }} />}
 </button>
 {showPrompts && (
 <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
 {parsed.prompts.map((p, i) => (
 <div key={p.id ?? i} className="rounded-xl p-4 mt-4" style={{ background: "rgba(255, 255, 255,0.08)", border: "1px solid rgba(255, 255, 255,0.2)" }}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>Prompt {i + 1}</span>
 {p.wordLimit && <span className="text-xs" style={{ color: "var(--gold-dark)" }}>{p.wordLimit} words</span>}
 </div>
 <p className="text-sm" style={{ color: "var(--text-2)" }}>{p.prompt}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Match score details */}
 {matchScore && (
 <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
 <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Why this score?</h3>
 <div className="grid grid-cols-2 gap-2 mb-4">
 {Object.entries(matchScore.breakdown ?? {}).map(([key, value]) => (
 <div key={key} className="flex items-center justify-between text-xs">
 <span className="capitalize" style={{ color: "var(--text-3)" }}>{key.replace(/([A-Z])/g, " $1").trim()}</span>
 <span className={`font-semibold ${scoreToColor(value as number)}`}>{value as number}%</span>
 </div>
 ))}
 </div>
 {matchScore.strengths?.length > 0 && (
 <div>
 <div className="text-xs font-semibold mb-1" style={{ color: "var(--green)" }}>Strengths</div>
 {matchScore.strengths.map((s) => (
 <div key={s} className="flex items-start gap-1.5 text-xs mb-1" style={{ color: "var(--text-2)" }}>
 <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "var(--green)" }} />{s}
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Actions */}
 <div className="flex gap-3 flex-wrap">
 <button onClick={handleSave} className="btn-gold flex items-center gap-2 text-sm">
 <BookmarkPlus className="w-4 h-4" /> Save to Dashboard
 </button>
 {parsed.applicationUrl && (
 <a href={parsed.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-sm">
 <ExternalLink className="w-4 h-4" /> Visit Application
 </a>
 )}
 {parsed.prompts.length > 0 && (
 <Link href="/essays" className="btn-ghost flex items-center gap-2 text-sm">
 <FileText className="w-4 h-4" /> Write Essay
 </Link>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
