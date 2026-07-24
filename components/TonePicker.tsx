"use client";

import { useId, useMemo, useState } from "react";
import {
 DEFAULT_TONE_ID,
 FEATURED_TONE_IDS,
 TONE_ARCHETYPES,
 TONE_COUNT,
 TONE_LIBRARY,
 TONE_REGISTERS,
 TONE_TEXTURES,
 composeToneId,
 getToneDescription,
 getToneLabel,
 parseToneId,
 searchToneOptions,
 type ToneFacet,
} from "@/lib/ai/tones";
import { Check, ChevronDown, Mic, Search, SlidersHorizontal, X } from "lucide-react";

const DEFAULT_SELECTION = parseToneId(DEFAULT_TONE_ID)!;

export function TonePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
 const catalogueId = useId();
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [showAdvanced, setShowAdvanced] = useState(false);
 const [draftId, setDraftId] = useState(parseToneId(value) ? value : DEFAULT_TONE_ID);

 const searchResults = useMemo(() => searchToneOptions(query, TONE_COUNT), [query]);
 const visibleSearchResults = searchResults.slice(0, 80);
 const featured = FEATURED_TONE_IDS.map((id) => TONE_LIBRARY.find((option) => option.id === id)).filter(Boolean);
 const currentLabel = getToneLabel(value) ?? "Choose a voice";
 const draftSelection = parseToneId(draftId) ?? DEFAULT_SELECTION;
 const draftLabel = getToneLabel(draftId) ?? getToneLabel(DEFAULT_TONE_ID)!;
 const draftDescription = getToneDescription(draftId) ?? getToneDescription(DEFAULT_TONE_ID)!;

 function toggleCatalogue() {
  if (!open) {
   setDraftId(parseToneId(value) ? value : DEFAULT_TONE_ID);
   setQuery("");
   setShowAdvanced(false);
  }
  setOpen((isOpen) => !isOpen);
 }

 function updateFacet(facet: keyof typeof draftSelection, facetValue: string) {
  setDraftId(composeToneId({ ...draftSelection, [facet]: facetValue }));
 }

 function applyVoice() {
  onChange(draftId);
  setOpen(false);
  setQuery("");
 }

 return (
  <div className="relative">
   <button
    type="button"
    onClick={toggleCatalogue}
    aria-expanded={open}
    aria-controls={catalogueId}
    aria-haspopup="dialog"
    aria-label={`Voice and tone. Current selection: ${currentLabel}`}
    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
    style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text)" }}
   >
    <Mic className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
    <span className="flex-1 text-left truncate">{currentLabel}</span>
    <span className="text-xs shrink-0" style={{ color: "var(--text-3)" }}>Featured voices</span>
    <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
   </button>

   {open && (
    <div
     id={catalogueId}
     role="dialog"
     aria-label="Voice and tone catalogue"
     onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
     className="absolute z-40 right-0 mt-2 rounded-xl overflow-hidden flex flex-col"
     style={{
      width: "min(46rem, calc(100vw - 2rem))",
      maxHeight: "min(78vh, 46rem)",
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
     }}
    >
     <div className="flex items-start gap-3 p-4" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gold-10)" }}>
       <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--gold)" }} />
      </div>
      <div className="min-w-0 flex-1">
       <h3 className="text-sm font-semibold">Featured voices</h3>
       <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-3)" }}>
        Start with a proven essay voice. Open the full catalogue only when you want finer control.
       </p>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Close voice catalogue" className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-3)" }}>
       <X className="w-4 h-4" />
      </button>
     </div>

     {showAdvanced && (
     <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <label htmlFor={`${catalogueId}-search`} className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
       Search exact combinations
      </label>
      <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
       <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-3)" }} />
       <input
        id={`${catalogueId}-search`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try warm storyteller, candid realist, or literary"
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: "var(--text)" }}
       />
       {query && (
        <button type="button" onClick={() => setQuery("")} aria-label="Clear voice search" className="p-1 rounded" style={{ color: "var(--text-3)" }}>
         <X className="w-3.5 h-3.5" />
        </button>
       )}
      </div>
     </div>
     )}

     <div className="overflow-y-auto p-3">
      {showAdvanced && query.trim() ? (
       <SearchCatalogue
        query={query}
        total={searchResults.length}
        results={visibleSearchResults}
        selectedId={draftId}
        onSelect={setDraftId}
       />
      ) : (
       <>
        <section>
         <SectionHeading title="Best starting points" description="Pick one complete recipe before writing." />
         <div className="grid sm:grid-cols-2 gap-1.5 mt-2">
          {featured.map((option) => option && (
           <ToneRow
            key={option.id}
            label={option.label}
            description={getToneDescription(option.id) ?? ""}
            active={option.id === draftId}
            onClick={() => setDraftId(option.id)}
           />
          ))}
         </div>
        </section>

        {!showAdvanced ? (
         <button
          type="button"
          onClick={() => setShowAdvanced(true)}
          className="btn-ghost mt-4 w-full text-xs py-2"
         >
          Open full voice catalogue
         </button>
        ) : (
        <>
         <div className="my-4" style={{ borderTop: "1px solid var(--border)" }} />
         <section>
         <SectionHeading title="Build your own voice" description="Make three choices and review the recipe before applying it." />
         <div className="mt-4 space-y-5">
          <FacetSelector
           step="1"
           title="Writer stance"
           guidance="What point of view should guide the essay?"
           facets={TONE_ARCHETYPES}
           selected={draftSelection.archetype}
           onSelect={(facet) => updateFacet("archetype", facet)}
          />
          <FacetSelector
           step="2"
           title="Emotional texture"
           guidance="What feeling should sit underneath the words?"
           facets={TONE_TEXTURES}
           selected={draftSelection.texture}
           onSelect={(facet) => updateFacet("texture", facet)}
          />
          <FacetSelector
           step="3"
           title="Writing register"
           guidance="How formal and stylized should the language feel?"
           facets={TONE_REGISTERS}
           selected={draftSelection.register}
           onSelect={(facet) => updateFacet("register", facet)}
          />
         </div>
        </section>
        </>
        )}
       </>
      )}
     </div>

     <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
      <div className="min-w-0 flex-1" aria-live="polite">
       <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Your voice recipe</p>
       <p className="text-sm font-semibold mt-1">{draftLabel}</p>
       <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-3)" }}>{draftDescription}</p>
      </div>
      <button type="button" onClick={applyVoice} className="btn-gold shrink-0 px-5 py-2.5 text-sm">
       Use this voice
      </button>
     </div>
    </div>
   )}
  </div>
 );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
 return (
  <div>
   <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>{title}</h4>
   <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{description}</p>
  </div>
 );
}

function FacetSelector({ step, title, guidance, facets, selected, onSelect }: {
 step: string;
 title: string;
 guidance: string;
 facets: ToneFacet[];
 selected: string;
 onSelect: (key: string) => void;
}) {
 const selectedFacet = facets.find((facet) => facet.key === selected) ?? facets[0];
 return (
  <div>
   <div className="flex items-start gap-2">
    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "var(--gold-10)", color: "var(--gold)" }}>{step}</span>
    <div>
     <h5 className="text-sm font-semibold">{title}</h5>
     <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{guidance}</p>
    </div>
   </div>
   <div className="flex flex-wrap gap-1.5 mt-2.5">
    {facets.map((facet) => {
     const active = facet.key === selected;
     return (
      <button
       key={facet.key}
       type="button"
       aria-pressed={active}
       title={facet.directive}
       onClick={() => onSelect(facet.key)}
       className="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
       style={{
        background: active ? "var(--gold-10)" : "var(--surface-2)",
        border: `1px solid ${active ? "rgba(201,168,76,0.45)" : "var(--border)"}`,
        color: active ? "var(--gold-light)" : "var(--text-2)",
       }}
      >
       {facet.label}
      </button>
     );
    })}
   </div>
   <p className="text-xs mt-2 px-2.5 py-2 rounded-lg leading-relaxed" style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
    <span className="font-semibold" style={{ color: "var(--text)" }}>{selectedFacet.label}:</span> {sentenceCase(selectedFacet.directive)}.
   </p>
  </div>
 );
}

function SearchCatalogue({ query, total, results, selectedId, onSelect }: {
 query: string;
 total: number;
 results: typeof TONE_LIBRARY;
 selectedId: string;
 onSelect: (id: string) => void;
}) {
 if (!results.length) {
  return (
   <div className="text-center py-8">
    <p className="text-sm font-medium">No voice matches “{query}”</p>
    <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>Try one ingredient such as storyteller, warm, candid, polished, or intimate.</p>
   </div>
  );
 }
 return (
  <section>
   <SectionHeading
    title={`${total.toLocaleString()} matching ${total === 1 ? "voice" : "voices"}`}
    description={total > results.length ? `Showing the first ${results.length}. Add another word to narrow the catalogue.` : "Select a recipe, then review it below."}
   />
   <div className="grid sm:grid-cols-2 gap-1.5 mt-3">
    {results.map((option) => (
     <ToneRow
      key={option.id}
      label={option.label}
      description={getToneDescription(option.id) ?? ""}
      active={option.id === selectedId}
      onClick={() => onSelect(option.id)}
     />
    ))}
   </div>
  </section>
 );
}

function ToneRow({ label, description, active, onClick }: { label: string; description: string; active: boolean; onClick: () => void }) {
 return (
  <button
   type="button"
   aria-pressed={active}
   onClick={onClick}
   className="w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors"
   style={{ background: active ? "var(--gold-10)" : "var(--surface-2)", border: "1px solid var(--border)", color: active ? "var(--gold-light)" : "var(--text-2)" }}
  >
   <span className="min-w-0 flex-1">
    <span className="block text-sm font-medium truncate">{label}</span>
    <span className="block text-[11px] leading-relaxed mt-1 line-clamp-2" style={{ color: "var(--text-3)" }}>{description}</span>
   </span>
   {active && <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />}
  </button>
 );
}

function sentenceCase(text: string): string {
 return text.charAt(0).toUpperCase() + text.slice(1);
}
