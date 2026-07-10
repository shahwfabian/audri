"use client";

import { useMemo, useState } from "react";
import { TONE_LIBRARY, TONE_COUNT, FEATURED_TONE_IDS, getToneLabel } from "@/lib/ai/tones";
import { Mic, Search, Check, ChevronDown } from "lucide-react";

/**
 * Grammarly-style voice picker, but over 1,440 combinatorial voices.
 * Searchable so the huge library stays usable.
 */
export function TonePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState("");

 const results = useMemo(() => {
 const q = query.trim().toLowerCase();
 if (!q) return [];
 const terms = q.split(/\s+/);
 return TONE_LIBRARY.filter((o) => terms.every((t) => o.hint.includes(t))).slice(0, 60);
 }, [query]);

 const featured = FEATURED_TONE_IDS.map((id) => TONE_LIBRARY.find((o) => o.id === id)!).filter(Boolean);
 const currentLabel = getToneLabel(value) ?? "Choose a voice";

 function pick(id: string) {
 onChange(id);
 setOpen(false);
 setQuery("");
 }

 return (
 <div className="relative">
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
 style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text)" }}
 >
 <Mic className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
 <span className="flex-1 text-left truncate">{currentLabel}</span>
 <span className="text-xs shrink-0" style={{ color: "var(--text-3)" }}>{TONE_COUNT.toLocaleString()} voices</span>
 <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
 </button>

 {open && (
 <div
 className="absolute z-40 mt-2 w-full rounded-xl overflow-hidden"
 style={{ background: "var(--surface)", border: "1px solid var(--border-2)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
 >
 {/* Search */}
 <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
 <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
 <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />
 <input
 autoFocus
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search 1,440 voices, try “bold advocate” or “wry literary”"
 className="flex-1 bg-transparent outline-none text-sm"
 style={{ color: "var(--text)" }}
 />
 </div>
 </div>

 <div className="max-h-72 overflow-y-auto p-2">
 {query.trim() ? (
 results.length ? (
 results.map((o) => (
 <ToneRow key={o.id} label={o.label} active={o.id === value} onClick={() => pick(o.id)} />
 ))
 ) : (
 <p className="text-xs text-center py-6" style={{ color: "var(--text-3)" }}>
 No voice matches that. Try a texture (warm, bold, wry) or an archetype (storyteller, analyst, poet).
 </p>
 )
 ) : (
 <>
 <div className="text-[11px] font-semibold uppercase tracking-widest px-2 py-1.5" style={{ color: "var(--gold)" }}>
 Featured
 </div>
 {featured.map((o) => (
 <ToneRow key={o.id} label={o.label} active={o.id === value} onClick={() => pick(o.id)} />
 ))}
 <p className="text-xs px-2 pt-3 pb-1" style={{ color: "var(--text-3)" }}>
 …or search {TONE_COUNT.toLocaleString()} voices above, every combination of 20 archetypes, 12 textures, and 6 registers.
 </p>
 </>
 )}
 </div>
 </div>
 )}
 </div>
 );
}

function ToneRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
 return (
 <button
 type="button"
 onClick={onClick}
 className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
 style={{ background: active ? "var(--gold-10)" : "transparent", color: active ? "var(--gold-light)" : "var(--text-2)" }}
 onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
 onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
 >
 <span className="flex-1 truncate">{label}</span>
 {active && <Check className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />}
 </button>
 );
}
