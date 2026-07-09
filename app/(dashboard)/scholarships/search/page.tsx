"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import {
  Search,
  BookmarkPlus,
  BookmarkCheck,
  ExternalLink,
  Clock,
  DollarSign,
  Sparkles,
  RefreshCw,
  ChevronRight,
  GraduationCap,
  Loader2,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
} from "lucide-react";
import type { ScrapedScholarship } from "@/lib/scrapers/types";
import type { SavedScholarship, StudentProfile } from "@/lib/types";

const CATEGORY_FILTERS = [
  "All", "No Essay", "Need-Based", "Merit", "STEM", "Community Service",
  "Leadership", "Women", "Minority", "First Generation", "Graduate",
  "High School", "Athletics", "Arts", "Business", "Healthcare",
  "International", "Full Ride", "Local", "Transfer",
];

const SOURCE_LABELS: Record<string, { label: string }> = {
  "scholarships.com":      { label: "Scholarships.com" },
  "fastweb.com":           { label: "Fastweb" },
  "how2winscholarships.com":{ label: "How2Win" },
  seed:                    { label: "Curated" },
};

// ── Eligibility engine ─────────────────────────────────────────────────────

type EligStatus = "eligible" | "ineligible" | "partial" | "unknown";

interface EligResult {
  status: EligStatus;
  blocking: string[];
  passing: string[];
}

const STEM_KEYWORDS    = ["computer","engineer","math","physics","chemistry","biology","science","technology","data","information","cyber","software","electrical","mechanical","aerospace"];
const HEALTH_KEYWORDS  = ["nursing","medicine","medical","health","pharmacy","dental","therapy","pre-med","premed","clinical","biomedical","physician"];
const BIZ_KEYWORDS     = ["business","finance","accounting","economics","marketing","management","mba","entrepreneur","administration"];
const ARTS_KEYWORDS    = ["art","design","music","theater","film","creative","visual","performing","dance","writing","journalism","communication"];

function checkEligibility(s: ScrapedScholarship, profile: StudentProfile | null): EligResult {
  if (!profile) return { status: "unknown", blocking: [], passing: [] };

  const cats    = s.categories.map((c) => c.toLowerCase());
  const major   = (profile.major || profile.intendedMajor || "").toLowerCase();
  const demos   = (profile.demographics ?? []).map((d) => d.toLowerCase());
  const eduLvl  = profile.educationLevel ?? "";
  const blocking: string[] = [];
  const passing: string[]  = [];

  // Women-only
  if (cats.some(c => c === "women" || c === "women's")) {
    const isFemale = demos.some(d => /women|female|girl/i.test(d));
    if (isFemale) passing.push("Women eligible");
    else blocking.push("Women only");
  }

  // First-gen
  if (cats.some(c => c.includes("first gen"))) {
    if (profile.isFirstGeneration) passing.push("First-generation");
    else if (profile.isFirstGeneration === false) blocking.push("First-generation only");
  }

  // Graduate only
  if (cats.includes("graduate")) {
    if (["GRADUATE","DOCTORAL"].includes(eduLvl)) passing.push("Graduate level");
    else if (eduLvl && !["GRADUATE","DOCTORAL"].includes(eduLvl)) blocking.push("Graduate students only");
  }

  // High school only
  if (cats.includes("high school")) {
    if (eduLvl === "HIGH_SCHOOL") passing.push("High school eligible");
    else if (eduLvl) blocking.push("High school students only");
  }

  // International only
  if (cats.includes("international")) {
    if (profile.isInternational) passing.push("International eligible");
    else if (profile.isInternational === false) blocking.push("International students only");
  }

  // STEM field
  if (cats.includes("stem")) {
    if (major && STEM_KEYWORDS.some((k) => major.includes(k))) passing.push("STEM major match");
    else if (major) blocking.push("STEM major preferred");
  }

  // Healthcare
  if (cats.includes("healthcare")) {
    if (major && HEALTH_KEYWORDS.some((k) => major.includes(k))) passing.push("Healthcare major match");
    else if (major) blocking.push("Healthcare major preferred");
  }

  // Business
  if (cats.includes("business")) {
    if (major && BIZ_KEYWORDS.some((k) => major.includes(k))) passing.push("Business major match");
    else if (major) blocking.push("Business major preferred");
  }

  // Arts
  if (cats.includes("arts")) {
    if (major && ARTS_KEYWORDS.some((k) => major.includes(k))) passing.push("Arts major match");
    else if (major) blocking.push("Arts major preferred");
  }

  // Need-based
  if (cats.includes("need-based")) {
    const income = (profile as { incomeLevel?: string }).incomeLevel;
    if (income && ["UNDER_30K","30K_60K"].includes(income)) passing.push("Need-based eligible");
    else if (income && ["60K_100K","OVER_100K"].includes(income)) blocking.push("Need-based — income may exceed limit");
  }

  // Minority
  if (cats.includes("minority")) {
    const minorityGroups = ["hispanic","latino","black","african","native","indigenous","pacific islander"];
    if (demos.some(d => minorityGroups.some(g => d.includes(g)))) passing.push("Minority demographic match");
  }

  const noProfileData = !profile.major && !profile.educationLevel && !demos.length;

  if (blocking.length > 0) return { status: "ineligible", blocking, passing };
  if (noProfileData)        return { status: "unknown",    blocking, passing };
  if (passing.length > 0)   return { status: "eligible",   blocking, passing };
  return { status: "partial", blocking, passing };
}

function EligBadge({ result }: { result: EligResult }) {
  if (result.status === "eligible") return (
    <div className="flex items-center gap-1.5 text-xs font-medium badge-green px-2.5 py-1 rounded-full">
      <ShieldCheck className="w-3 h-3" />
      You qualify
    </div>
  );
  if (result.status === "ineligible") return (
    <div className="flex items-center gap-1.5 text-xs font-medium badge-red px-2.5 py-1 rounded-full">
      <ShieldX className="w-3 h-3" />
      May not qualify
    </div>
  );
  if (result.status === "partial") return (
    <div className="flex items-center gap-1.5 text-xs font-medium badge-amber px-2.5 py-1 rounded-full">
      <ShieldQuestion className="w-3 h-3" />
      Check requirements
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-xs badge-gray px-2.5 py-1 rounded-full" style={{ color: "var(--text-3)" }}>
      <ShieldQuestion className="w-3 h-3" />
      Build profile to check
    </div>
  );
}

function ScholarshipCard({
  scholarship, isSaved, onSave, eligResult,
}: {
  scholarship: ScrapedScholarship;
  isSaved: boolean;
  onSave: (s: ScrapedScholarship) => void;
  eligResult: EligResult;
}) {
  const src     = SOURCE_LABELS[scholarship.source] ?? { label: scholarship.source };
  const hasEssay = scholarship.prompts.length > 0;
  const excerpt  = scholarship.description?.length > 180
    ? scholarship.description.slice(0, 180) + "…"
    : scholarship.description;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 card-glow-hover transition-all"
      style={{
        background: "var(--surface)",
        borderColor: eligResult.status === "eligible"
          ? "rgba(32,200,120,0.15)"
          : eligResult.status === "ineligible"
          ? "rgba(229,80,80,0.12)"
          : "var(--border)",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="badge-gold text-xs px-2 py-0.5 rounded-full font-medium">{src.label}</span>
            {scholarship.categories.slice(0, 2).map((c) => (
              <span key={c} className="badge-gray text-xs px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
          <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text)" }}>{scholarship.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{scholarship.organization}</p>
        </div>
        <button
          onClick={() => onSave(scholarship)}
          title={isSaved ? "Saved" : "Save scholarship"}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: isSaved ? "var(--gold-10)" : "var(--surface-2)",
            color: isSaved ? "var(--gold)" : "var(--text-3)",
            border: `1px solid ${isSaved ? "var(--gold-25)" : "var(--border-2)"}`,
          }}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
        </button>
      </div>

      {/* Amount + Deadline */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 font-bold text-gradient">
          <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--gold-light)" }}>{scholarship.amountText}</span>
        </div>
        {scholarship.deadlineText && (
          <div className="flex items-center gap-1" style={{ color: "var(--text-2)" }}>
            <Clock className="w-3.5 h-3.5" />
            {scholarship.deadlineText}
          </div>
        )}
        {hasEssay
          ? <span style={{ color: "var(--text-3)" }}>Essay required</span>
          : <span className="font-medium" style={{ color: "var(--green)" }}>No essay</span>
        }
      </div>

      {/* Description */}
      {excerpt && <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{excerpt}</p>}

      {/* Eligibility badge + reasoning */}
      <div className="flex items-start justify-between gap-2">
        <EligBadge result={eligResult} />
        {eligResult.blocking.length > 0 && (
          <p className="text-xs" style={{ color: "var(--red)" }}>{eligResult.blocking[0]}</p>
        )}
        {eligResult.blocking.length === 0 && eligResult.passing.length > 0 && (
          <p className="text-xs" style={{ color: "var(--green)" }}>{eligResult.passing[0]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(scholarship)}
          disabled={isSaved}
          className={isSaved ? "flex-1 text-xs py-2 rounded-xl font-medium" : "flex-1 btn-gold text-xs py-2 rounded-xl"}
          style={isSaved ? { background: "var(--surface-2)", color: "var(--text-3)" } : {}}
        >
          {isSaved ? "Saved ✓" : "Save to Dashboard"}
        </button>
        {scholarship.applicationUrl && (
          <a
            href={scholarship.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center justify-center w-9 h-8 rounded-xl"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ScholarshipSearchPage() {
  const { profile, savedScholarships, addScholarship } = useAppStore();

  const [query,          setQuery]          = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [scholarships,   setScholarships]   = useState<ScrapedScholarship[]>([]);
  const [total,          setTotal]          = useState(0);
  const [dbTotal,        setDbTotal]        = useState(0);
  const [lastUpdated,    setLastUpdated]    = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [offset,         setOffset]         = useState(0);
  const [scraping,       setScraping]       = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [minAmount,      setMinAmount]      = useState("");
  const [maxAmount,      setMaxAmount]      = useState("");
  const [eligibleOnly,   setEligibleOnly]   = useState(false);

  const LIMIT = 24;

  const profileComplete = (profile?.achievements?.length ?? 0) > 0 || !!profile?.major || !!profile?.educationLevel;
  const savedIds = new Set(savedScholarships.map((s) => s.scholarship.applicationUrl ?? s.scholarship.name));

  const fetchScholarships = useCallback(async (reset = false) => {
    setLoading(true);
    const newOffset = reset ? 0 : offset;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (activeCategory !== "All") params.append("cat", activeCategory);
    if (minAmount) params.set("minAmount", minAmount);
    if (maxAmount) params.set("maxAmount", maxAmount);
    params.set("limit", String(LIMIT));
    params.set("offset", String(newOffset));

    try {
      const res  = await fetch(`/api/scholarships?${params.toString()}`);
      const data = await res.json();
      if (reset) {
        setScholarships(data.scholarships);
        setOffset(LIMIT);
      } else {
        setScholarships((prev) => [...prev, ...data.scholarships]);
        setOffset(newOffset + LIMIT);
      }
      setTotal(data.total);
      setDbTotal(data.dbTotal);
      setLastUpdated(data.lastUpdated);
    } catch {
      toast.error("Could not load scholarships.");
    } finally {
      setLoading(false);
    }
  }, [query, activeCategory, minAmount, maxAmount, offset]);

  useEffect(() => { fetchScholarships(true); }, []); // eslint-disable-line
  useEffect(() => { fetchScholarships(true); }, [activeCategory]); // eslint-disable-line

  async function triggerScrape() {
    setScraping(true);
    toast.info("Scraping started — this takes 2–5 minutes.");
    try {
      await fetch("/api/scholarships/scrape", { method: "POST", body: JSON.stringify({ source: "all" }) });
      setTimeout(() => { fetchScholarships(true); setScraping(false); }, 10000);
    } catch {
      toast.error("Scrape failed.");
      setScraping(false);
    }
  }

  function handleSave(s: ScrapedScholarship) {
    if (savedIds.has(s.applicationUrl ?? s.name)) { toast.info("Already saved."); return; }
    const saved: SavedScholarship = {
      id: generateId("saved"),
      userId: profile?.userId ?? "",
      scholarship: {
        id: s.id, name: s.name, organization: s.organization, amountText: s.amountText,
        amount: s.amount, deadlineText: s.deadlineText, deadline: s.deadline,
        description: s.description, eligibility: s.eligibility, eligibilityRules: undefined,
        prompts: s.prompts, requirements: s.requirements, applicationUrl: s.applicationUrl,
        categories: s.categories, tags: s.tags, isNational: true, source: "DATABASE",
        createdAt: new Date().toISOString(),
      },
      status: "SAVED", checklist: [], essayDrafts: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    addScholarship(saved);
    toast.success(`"${s.name}" saved to your dashboard!`);
  }

  const eligResults = scholarships.map((s) => checkEligibility(s, profile));

  const displayed = eligibleOnly
    ? scholarships.filter((_, i) => eligResults[i].status !== "ineligible")
    : scholarships;

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const eligibleCount = eligResults.filter(r => r.status === "eligible").length;
  const ineligibleCount = eligResults.filter(r => r.status === "ineligible").length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Find Scholarships</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            {dbTotal > 0 ? `${dbTotal.toLocaleString()} scholarships from Scholarships.com, Fastweb & How2Win` : "Loading scholarship database…"}
            {formattedDate && <span style={{ color: "var(--text-3)" }}> · Updated {formattedDate}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost flex items-center gap-1.5 text-sm px-3 py-2"
            style={showFilters ? { borderColor: "var(--gold)", color: "var(--gold)", background: "var(--gold-10)" } : {}}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button onClick={triggerScrape} disabled={scraping} title="Scrape fresh data" className="btn-ghost flex items-center gap-1.5 text-sm px-3 py-2">
            {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {scraping ? "Scraping…" : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Profile completeness prompt */}
      {!profileComplete && (
        <div className="rounded-2xl border p-5 flex items-center justify-between gap-4" style={{ background: "var(--gold-10)", borderColor: "var(--gold-25)" }}>
          <div>
            <div className="font-semibold mb-1 text-sm" style={{ color: "var(--gold-light)" }}>Get personalized eligibility screening</div>
            <p className="text-sm" style={{ color: "var(--gold-dark)" }}>
              Set your GPA, major, state, and education level in your profile — and Audri will only show you scholarships you can actually win.
            </p>
          </div>
          <Link href="/profile" className="btn-gold text-sm px-4 py-2 shrink-0 whitespace-nowrap">
            Build profile →
          </Link>
        </div>
      )}

      {/* Eligibility summary bar */}
      {profileComplete && scholarships.length > 0 && (
        <div className="rounded-xl border p-4 flex items-center gap-4 flex-wrap" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: "var(--gold)" }} />
          <div className="flex items-center gap-4 text-sm flex-wrap flex-1">
            <span className="font-medium" style={{ color: "var(--green)" }}>{eligibleCount} you qualify for</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ color: "var(--red)" }}>{ineligibleCount} may not match</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ color: "var(--text-2)" }}>{scholarships.length - eligibleCount - ineligibleCount} unconfirmed</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setEligibleOnly(!eligibleOnly)}
              className="w-10 h-5 rounded-full transition-colors relative cursor-pointer"
              style={{ background: eligibleOnly ? "var(--gold)" : "var(--border-2)" }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: eligibleOnly ? "calc(100% - 18px)" : "2px" }} />
            </div>
            <span className="text-xs" style={{ color: "var(--text-2)" }}>Eligible only</span>
          </label>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchScholarships(true)}
          placeholder="Search by name, major, keyword, organization…"
          className="input-dark w-full pl-11 pr-10 py-3 text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(""); fetchScholarships(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Advanced Filters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Min amount ($)</label>
              <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="500" className="input-dark w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Max amount ($)</label>
              <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="50000" className="input-dark w-full px-3 py-2 text-sm" />
            </div>
          </div>
          <button onClick={() => fetchScholarships(true)} className="btn-gold mt-4 text-sm px-4 py-2">
            Apply Filters
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
            style={{
              background: activeCategory === cat ? "var(--gold)" : "var(--surface)",
              borderColor: activeCategory === cat ? "var(--gold)" : "var(--border-2)",
              color: activeCategory === cat ? "#080808" : "var(--text-2)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          {loading ? "Loading…" : `${eligibleOnly ? displayed.length : total} scholarships`}
          {activeCategory !== "All" && <span className="font-medium" style={{ color: "var(--text)" }}> · {activeCategory}</span>}
        </p>
        {query && (
          <button onClick={() => { setQuery(""); setActiveCategory("All"); fetchScholarships(true); }} className="text-xs hover:underline" style={{ color: "var(--gold)" }}>
            Clear search
          </button>
        )}
      </div>

      {/* Grid */}
      {loading && scholarships.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gold)" }} />
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Loading scholarships…</p>
          </div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border py-20 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <GraduationCap className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--border-3)" }} />
          <p className="font-semibold" style={{ color: "var(--text)" }}>No scholarships found</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Try a different search or{" "}
            <button onClick={triggerScrape} className="underline" style={{ color: "var(--gold)" }}>refresh data</button>.
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((s, idx) => {
              const realIdx = eligibleOnly ? scholarships.indexOf(s) : idx;
              return (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  isSaved={savedIds.has(s.applicationUrl ?? s.name)}
                  onSave={handleSave}
                  eligResult={eligResults[realIdx] ?? { status: "unknown", blocking: [], passing: [] }}
                />
              );
            })}
          </div>

          {!eligibleOnly && scholarships.length < total && (
            <div className="flex justify-center pt-4">
              <button onClick={() => fetchScholarships(false)} disabled={loading} className="btn-ghost flex items-center gap-2 text-sm px-5 py-2.5">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Load more ({total - scholarships.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Data sources footer */}
      <div className="rounded-2xl border p-5 mt-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Data Sources</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SOURCE_LABELS).map(([, val]) => (
            <span key={val.label} className="badge-gold text-xs px-2.5 py-1 rounded-full font-medium">{val.label}</span>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
          Data scraped from public pages of partner sites. Click &ldquo;Refresh Data&rdquo; to pull the latest listings.
          Eligibility screening uses your profile — <Link href="/profile" className="underline" style={{ color: "var(--gold)" }}>complete your profile</Link> for accurate results.
        </p>
      </div>
    </div>
  );
}
