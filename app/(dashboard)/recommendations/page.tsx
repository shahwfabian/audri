"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { safeApiResponse } from "@/lib/errors";
import { toast } from "sonner";
import { Mail, Loader2, Copy, Sparkles, Info } from "lucide-react";

const RECOMMENDER_TYPES = [
 { value: "Teacher", desc: "A teacher who taught you in class" },
 { value: "Counselor", desc: "Your school counselor" },
 { value: "Employer", desc: "A boss or manager from a job" },
 { value: "Coach", desc: "An athletic or academic coach" },
 { value: "Mentor", desc: "A mentor, pastor, or community leader" },
];

export default function RecommendationsPage() {
 const { profile, user } = useAppStore();

 const [recommenderName, setRecommenderName] = useState("");
 const [recommenderRole, setRecommenderRole] = useState("Teacher");
 const [relationship, setRelationship] = useState("");
 const [duration, setDuration] = useState("");
 const [strengths, setStrengths] = useState("");
 const [anecdotes, setAnecdotes] = useState("");
 const [scholarshipName, setScholarshipName] = useState("");
 const [generating, setGenerating] = useState(false);
 const [letter, setLetter] = useState<string | null>(null);

 async function handleGenerate() {
 if (!profile) {
 toast.error("Build your profile first.");
 return;
 }
 if (!relationship.trim()) {
 toast.error("Tell us how this person knows you, that's the heart of the letter.");
 return;
 }

 setGenerating(true);
 setLetter(null);

 const res = await fetch("/api/ai/recommendation", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
 },
 body: JSON.stringify({
 profile,
 recommenderName,
 recommenderRole,
 relationship,
 duration,
 strengths,
 anecdotes,
 scholarshipName,
 }),
 });

 const { data, error } = await safeApiResponse<{ letter: string }>(res);
 setGenerating(false);

 if (error || !data) {
 toast.error(error ?? "Could not draft the letter. Try again.");
 return;
 }
 setLetter(data.letter);
 toast.success("Draft ready, hand it to your recommender.");
 }

 function handleCopy() {
 if (!letter) return;
 navigator.clipboard.writeText(letter);
 toast.success("Letter copied.");
 }

 return (
 <div className="max-w-5xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Recommendation Letters</h1>
 <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
 Draft the letter yourself, hand it to your teacher or employer, and make saying &quot;yes&quot; effortless for them.
 </p>
 </div>

 {/* How it works */}
 <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
 <p className="text-xs leading-relaxed" style={{ color: "var(--gold-light)" }}>
 Teachers and employers are busy, many will ask YOU for a draft anyway. Give them one and your letter
 gets done faster, says what you need it to say, and they polish it in their own voice before signing.
 This is standard practice; the recommender always reviews, edits, and approves the final letter.
 </p>
 </div>

 {!profile && (
 <div className="rounded-2xl p-4 flex items-center justify-between gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 <p className="text-sm" style={{ color: "var(--text-2)" }}>The letter is built from your real profile.</p>
 <Link href="/onboarding" className="btn-gold text-sm px-4 py-2 shrink-0">Build my profile</Link>
 </div>
 )}

 <div className="grid lg:grid-cols-2 gap-6">
 {/* Form */}
 <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 <div>
 <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
 Who is recommending you?
 </label>
 <div className="flex flex-wrap gap-2">
 {RECOMMENDER_TYPES.map((t) => (
 <button
 key={t.value}
 type="button"
 onClick={() => setRecommenderRole(t.value)}
 aria-pressed={recommenderRole === t.value}
 title={t.desc}
 className="text-xs px-3 py-2 rounded-lg transition-colors font-medium"
 style={{
 background: recommenderRole === t.value ? "var(--gold)" : "var(--surface-2)",
 color: recommenderRole === t.value ? "#080808" : "var(--text-2)",
 border: "1px solid " + (recommenderRole === t.value ? "var(--gold)" : "var(--border-2)"),
 }}
 >
 {t.value}
 </button>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Their name (optional)</label>
 <input value={recommenderName} onChange={(e) => setRecommenderName(e.target.value)} placeholder="Ms. Rivera" className="input-dark w-full text-sm" />
 </div>
 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>How long have they known you?</label>
 <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="2 years" className="input-dark w-full text-sm" />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
 How do they know you? <span style={{ color: "var(--gold)" }}>*</span>
 </label>
 <input
 value={relationship}
 onChange={(e) => setRelationship(e.target.value)}
 placeholder="AP English teacher junior year; I was also in her journalism club"
 className="input-dark w-full text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Strengths you want highlighted</label>
 <input
 value={strengths}
 onChange={(e) => setStrengths(e.target.value)}
 placeholder="Work ethic, leadership, writing ability"
 className="input-dark w-full text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
 Specific moments they witnessed (the more real, the stronger)
 </label>
 <textarea
 value={anecdotes}
 onChange={(e) => setAnecdotes(e.target.value)}
 rows={4}
 placeholder="She saw me rewrite my op-ed five times until it got published in the school paper. I stayed after class to help two classmates pass the AP exam…"
 className="input-dark w-full resize-none text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>Scholarship it&apos;s for (optional)</label>
 <input
 value={scholarshipName}
 onChange={(e) => setScholarshipName(e.target.value)}
 placeholder="Coca-Cola Scholars, or leave blank for a general letter"
 className="input-dark w-full text-sm"
 />
 </div>

 <button
 onClick={handleGenerate}
 disabled={generating || !profile}
 className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-50"
 >
 {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting…</> : <><Sparkles className="w-4 h-4" /> Draft My Letter</>}
 </button>
 </div>

 {/* Result */}
 <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 {letter ? (
 <>
 <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
 <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
 Draft for {recommenderName || recommenderRole}
 </span>
 <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-2">
 <Copy className="w-3.5 h-3.5" /> Copy
 </button>
 </div>
 <div className="px-6 py-6 overflow-y-auto">
 {letter.split(/\n{2,}/).map((para, i) => (
 <p key={i} className="text-sm mb-3.5 last:mb-0" style={{ color: "var(--text)", lineHeight: 1.8, fontFamily: "Georgia, serif" }}>
 {para}
 </p>
 ))}
 </div>
 <div className="px-5 py-3 mt-auto" style={{ borderTop: "1px solid var(--border)" }}>
 <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
 Hand this to your recommender to edit and sign, anything in [brackets] is for them to fill in.
 </p>
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center py-24 px-8 text-center">
 <Mail className="w-10 h-10 mb-4" style={{ color: "var(--text-3)" }} />
 <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>No draft yet</p>
 <p className="text-xs max-w-xs" style={{ color: "var(--text-3)" }}>
 Fill in who&apos;s recommending you and what they&apos;ve seen you do, the letter appears here.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
