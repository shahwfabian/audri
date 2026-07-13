"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
 STORY_STARTERS,
 STORY_CATEGORIES,
 STORY_STARTER_COUNT,
 starterToNote,
 type StoryStarter,
} from "@/lib/ai/storyStarters";
import { Sparkles, Search, ChevronDown, Quote, Mic, ShieldCheck, ArrowRight } from "lucide-react";

export default function StoryStudioPage() {
 const router = useRouter();
 const { setPendingStoryAngle } = useAppStore();
 const [query, setQuery] = useState("");
 const [openId, setOpenId] = useState<string | null>(null);

 const filtered = useMemo(() => {
 const q = query.trim().toLowerCase();
 if (!q) return STORY_STARTERS;
 return STORY_STARTERS.filter((s) =>
 `${s.title} ${s.experience} ${s.category} ${s.metaphors.join(" ")} ${s.pairsWith.join(" ")}`
 .toLowerCase()
 .includes(q)
 );
 }, [query]);

 const byCategory = useMemo(() => {
 const map = new Map<string, StoryStarter[]>();
 for (const cat of STORY_CATEGORIES) map.set(cat, []);
 for (const s of filtered) map.get(s.category)?.push(s);
 return [...map.entries()].filter(([, list]) => list.length > 0);
 }, [filtered]);

 function selectAngle(starter: StoryStarter, metaphor?: string) {
 setPendingStoryAngle(starterToNote(starter, metaphor));
 router.push("/generate");
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6 pb-10">
 {/* Header */}
 <div className="text-center pt-2">
 <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold)" }}>
 <Quote className="w-3.5 h-3.5" /> Story Studio
 </div>
 <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
 Find your angle. <span className="text-gradient">Then make it yours.</span>
 </h1>
 <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
 {STORY_STARTER_COUNT}{" "}story starters, from a delivery job that paid the bills to launching the
 region&apos;s biggest conference. Each comes with metaphor lenses that turn a fact into a scene,
 and the voices they pair with.
 </p>
 </div>

 {/* Ethics note */}
 <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
 <p className="text-xs leading-relaxed" style={{ color: "var(--gold-light)" }}>
 These are mirrors, not masks. Pick the theme that matches <span className="font-semibold">your real life</span>, Audri helps you tell your true story with power, and never invents one for you.
 </p>
 </div>

 {/* Search */}
 <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
 <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search stories, “work”, “family”, “built”, “moved”, “music”…"
 className="flex-1 bg-transparent outline-none text-sm"
 style={{ color: "var(--text)" }}
 />
 </div>

 {/* Categories */}
 {byCategory.length === 0 ? (
 <p className="text-sm text-center py-10" style={{ color: "var(--text-3)" }}>
 No starters match that. Try a broader word like “work”, “family”, or “built”.
 </p>
 ) : (
 byCategory.map(([category, list]) => (
 <div key={category} className="space-y-2">
 <h2 className="text-xs font-semibold uppercase tracking-widest px-1 pt-2" style={{ color: "var(--text-3)" }}>
 {category}
 </h2>
 {list.map((s) => {
 const open = openId === s.id;
 return (
 <div key={s.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: `1px solid ${open ? "var(--gold-25)" : "var(--border-2)"}` }}>
 <button
 type="button"
 onClick={() => setOpenId(open ? null : s.id)}
 aria-expanded={open}
 className="w-full flex items-center gap-3 p-4 text-left transition-colors"
 >
 <div className="flex-1 min-w-0">
 <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{s.title}</div>
 <div className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>{s.experience}</div>
 </div>
 <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
 </button>

 {open && (
 <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
 {/* Surfacing question */}
 <div className="pt-4">
 <div className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--gold)" }}>Dig out your version</div>
 <p className="text-sm italic" style={{ color: "var(--text-2)", lineHeight: 1.6 }}>{s.surfacingQuestion}</p>
 </div>

 {/* Metaphor lenses */}
 <div>
 <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>Metaphor lenses, pick one to frame it</div>
 <div className="space-y-1.5">
 {s.metaphors.map((m) => (
 <button
 key={m}
 type="button"
 onClick={() => selectAngle(s, m)}
 className="w-full flex items-center gap-2 text-left rounded-xl px-3 py-2.5 transition-colors group"
 style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
 onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--gold-25)")}
 onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
 >
 <Quote className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--gold-dark)" }} />
 <span className="flex-1 text-sm" style={{ color: "var(--text)" }}>{m}</span>
 <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--gold)" }} />
 </button>
 ))}
 </div>
 </div>

 {/* Pairs with */}
 <div>
 <div className="text-[11px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--gold)" }}>
 <Mic className="w-3 h-3" /> Pairs with these voices
 </div>
 <div className="flex flex-wrap gap-1.5">
 {s.pairsWith.map((v) => (
 <span key={v} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold-light)" }}>{v}</span>
 ))}
 </div>
 </div>

 <button
 type="button"
 onClick={() => selectAngle(s)}
 className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
 >
 <Sparkles className="w-4 h-4" /> Use this story in my essay
 </button>
 </div>
 )}
 </div>
 );
 })}
 </div>
 ))
 )}
 </div>
 );
}
