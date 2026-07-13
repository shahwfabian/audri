"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { generateId, scoreToColor } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Loader2,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Copy,
  BarChart3,
} from "lucide-react";
import type { EssayDraft, Story } from "@/lib/types";

function EssayCard({ draft, onEdit }: { draft: EssayDraft; onEdit: (draft: EssayDraft) => void }) {
  const wordCount = draft.content.trim().split(/\s+/).length;
  return (
    <div className="p-4 rounded-xl transition-colors" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono truncate" style={{ color: "var(--text-3)" }}>
            {draft.prompt ? `"${draft.prompt.slice(0, 70)}${draft.prompt.length > 70 ? "..." : ""}"` : "Custom essay"}
          </p>
          {draft.scores && (
            <div className={`text-xs font-bold mt-0.5 ${scoreToColor(draft.scores.overall)}`}>
              Score: {draft.scores.overall}/100
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs" style={{ color: "var(--text-3)" }}>{wordCount} words</div>
          {draft.wordLimit && (
            <div className={`text-xs font-medium ${wordCount > draft.wordLimit ? "text-red-500" : "text-green-500"}`}>
              {draft.wordLimit} limit
            </div>
          )}
        </div>
      </div>
      <p className="text-xs line-clamp-2 leading-relaxed mb-2" style={{ color: "var(--text-2)" }}>
        {draft.content.slice(0, 160)}...
      </p>
      <button onClick={() => onEdit(draft)} className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--gold)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold-light)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
      >
        <Edit3 className="w-3 h-3" /> Edit essay
      </button>
    </div>
  );
}

export default function EssaysPage() {
  const { profile, user, savedScholarships, essayDrafts, addEssayDraft, updateEssayDraft } = useAppStore();

  const [selectedScholarshipId, setSelectedScholarshipId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [wordLimit, setWordLimit] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [activeEssay, setActiveEssay] = useState<EssayDraft | null>(null);
  const [editContent, setEditContent] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [revising, setRevising] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const stories = profile?.stories ?? [];
  const scholarships = savedScholarships;
  const selectedScholarship = scholarships.find((s) => s.id === selectedScholarshipId);
  const promptOptions = selectedScholarship?.scholarship.prompts ?? [];
  const [selectedPromptId, setSelectedPromptId] = useState("");
  const selectedPrompt = promptOptions.find((p) => p.id === selectedPromptId);
  const finalPrompt = selectedPrompt?.prompt ?? customPrompt;
  const finalWordLimit = selectedPrompt?.wordLimit ?? (wordLimit ? parseInt(wordLimit) : undefined);

  async function handleGenerate() {
    if (!finalPrompt.trim()) { toast.error("Please enter or select an essay prompt."); return; }
    if (!profile) { toast.error("Complete your profile first."); return; }
    setGenerating(true);
    try {
      const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;
      const scholarshipName = selectedScholarship?.scholarship.name ?? "Scholarship Application";
      const res = await fetch("/api/ai/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ profile, prompt: finalPrompt, wordLimit: finalWordLimit, story: selectedStory, scholarshipName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { essay, strategy } = await res.json();
      const draft: EssayDraft = {
        id: generateId("essay"),
        savedScholarshipId: selectedScholarshipId || undefined,
        storyId: selectedStoryId || undefined,
        prompt: finalPrompt,
        wordLimit: finalWordLimit,
        content: essay,
        strategy,
        versions: [{ id: generateId("v"), content: essay, note: "Initial draft", createdAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEssayDraft(draft);
      setActiveEssay(draft);
      setEditContent(essay);
      toast.success("Essay drafted! Review and revise with AI.");
      setScoring(true);
      try {
        const scoreRes = await fetch("/api/ai/critique-essay", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
          body: JSON.stringify({ essay, prompt: finalPrompt, wordLimit: finalWordLimit }),
        });
        if (scoreRes.ok) {
          const { scores, feedback } = await scoreRes.json();
          updateEssayDraft(draft.id, { scores, feedback });
          setActiveEssay((prev) => (prev ? { ...prev, scores, feedback } : prev));
        }
      } catch { /* scoring failed silently */ } finally { setScoring(false); }
    } catch {
      toast.error("Essay generation failed. Check your API key.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevise() {
    if (!activeEssay || !revisionNote.trim()) { toast.error("Enter revision instructions first."); return; }
    setRevising(true);
    try {
      const res = await fetch("/api/ai/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ mode: "revise", essay: editContent, revisionInstructions: revisionNote, wordLimit: activeEssay.wordLimit }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { essay } = await res.json();
      const newVersion = { id: generateId("v"), content: editContent, note: revisionNote, createdAt: new Date().toISOString() };
      updateEssayDraft(activeEssay.id, { content: essay, versions: [...(activeEssay.versions ?? []), newVersion], updatedAt: new Date().toISOString() });
      setEditContent(essay);
      setActiveEssay((prev) => (prev ? { ...prev, content: essay } : prev));
      setRevisionNote("");
      toast.success("Essay revised!");
    } catch {
      toast.error("Revision failed. Check your API key.");
    } finally { setRevising(false); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(editContent);
    toast.success("Essay copied to clipboard!");
  }

  function handleSaveEdit() {
    if (!activeEssay) return;
    updateEssayDraft(activeEssay.id, { content: editContent, updatedAt: new Date().toISOString() });
    toast.success("Essay saved.");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Essay Workspace</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Generate, edit, and refine scholarship essays from your real stories.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Generator panel */}
        <div className="lg:col-span-2 space-y-4">
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>Generate New Essay</h2>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                SCHOLARSHIP (OPTIONAL)
              </label>
              <select
                value={selectedScholarshipId}
                onChange={(e) => { setSelectedScholarshipId(e.target.value); setSelectedPromptId(""); }}
                className="input-dark w-full text-sm"
              >
                <option value="">Select scholarship or write custom prompt</option>
                {scholarships.map((s) => (
                  <option key={s.id} value={s.id}>{s.scholarship.name}</option>
                ))}
              </select>
            </div>

            {promptOptions.length > 0 && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>ESSAY PROMPT</label>
                <select value={selectedPromptId} onChange={(e) => setSelectedPromptId(e.target.value)} className="input-dark w-full text-sm">
                  <option value="">Select a prompt</option>
                  {promptOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.prompt.slice(0, 60)}...</option>
                  ))}
                </select>
              </div>
            )}

            {!selectedPromptId && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                  {promptOptions.length > 0 ? "OR CUSTOM PROMPT" : "ESSAY PROMPT"}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe a challenge you have overcome..."
                  className="input-dark w-full text-sm resize-none"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                WORD LIMIT {selectedPrompt?.wordLimit ? `(${selectedPrompt.wordLimit} required)` : "(OPTIONAL)"}
              </label>
              <input
                type="number"
                value={selectedPrompt?.wordLimit ?? wordLimit}
                onChange={(e) => setWordLimit(e.target.value)}
                disabled={!!selectedPrompt?.wordLimit}
                placeholder="500"
                className="input-dark w-full text-sm"
                style={selectedPrompt?.wordLimit ? { opacity: 0.6 } : {}}
              />
            </div>

            {stories.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-3)" }}>
                  ANCHOR STORY (OPTIONAL)
                </label>
                <select value={selectedStoryId} onChange={(e) => setSelectedStoryId(e.target.value)} className="input-dark w-full text-sm">
                  <option value="">Let AI choose best story</option>
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !finalPrompt.trim()}
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate Essay</>}
            </button>
          </div>

          {essayDrafts.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
              <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
                Saved Drafts ({essayDrafts.length})
              </h2>
              <div className="space-y-2">
                {essayDrafts.slice(0, 5).map((draft) => (
                  <EssayCard key={draft.id} draft={draft} onEdit={(d) => { setActiveEssay(d); setEditContent(d.content); }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Essay editor */}
        <div className="lg:col-span-3">
          {activeEssay ? (
            <div className="space-y-4">
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Essay Editor</h2>
                    {scoring && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "var(--gold)" }}>
                        <Loader2 className="w-3 h-3 animate-spin" /> Scoring...
                      </div>
                    )}
                    {activeEssay.scores && !scoring && (
                      <button
                        onClick={() => setShowScores(!showScores)}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreToColor(activeEssay.scores.overall)}`}
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        {activeEssay.scores.overall}/100
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleCopy} className="text-xs flex items-center gap-1 transition-colors" style={{ color: "var(--text-3)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button onClick={handleSaveEdit} className="text-xs flex items-center gap-1 font-medium transition-colors" style={{ color: "var(--gold)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold-light)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-2" style={{ color: "var(--text-3)" }}>
                  <span className="font-mono truncate max-w-xs">
                    {activeEssay.prompt ? `"${activeEssay.prompt.slice(0, 60)}..."` : "Essay"}
                  </span>
                  <span>{editContent.trim().split(/\s+/).length} words{activeEssay.wordLimit ? ` / ${activeEssay.wordLimit}` : ""}</span>
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={16}
                  className="input-dark w-full text-sm resize-none leading-relaxed"
                  style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
                />
              </div>

              {activeEssay.scores && showScores && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
                    <BarChart3 className="w-4 h-4" style={{ color: "var(--gold)" }} />
                    Essay Score Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { key: "promptAlignment", label: "Prompt Alignment" },
                      { key: "specificity", label: "Specificity" },
                      { key: "storyStrength", label: "Story Strength" },
                      { key: "emotionalAuthenticity", label: "Authenticity" },
                      { key: "structure", label: "Structure" },
                      { key: "clarity", label: "Clarity" },
                      { key: "openingStrength", label: "Opening" },
                      { key: "conclusionStrength", label: "Conclusion" },
                    ].map((item) => {
                      const value = activeEssay.scores![item.key as keyof typeof activeEssay.scores] as number;
                      return (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span style={{ color: "var(--text-3)" }}>{item.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
                              <div className="h-full rounded-full" style={{ width: `${value}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold-light))" }} />
                            </div>
                            <span className={`font-semibold w-6 text-right ${scoreToColor(value)}`}>{value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeEssay.feedback && (
                    <div className="space-y-3">
                      {activeEssay.feedback.strengths?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold mb-1" style={{ color: "var(--green)" }}>Strengths</div>
                          {activeEssay.feedback.strengths.map((s) => (
                            <div key={s} className="flex items-start gap-1.5 text-xs mb-1" style={{ color: "var(--text-2)" }}>
                              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--green)" }} />
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                      {activeEssay.feedback.weaknesses?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold mb-1" style={{ color: "var(--red)" }}>Areas to improve</div>
                          {activeEssay.feedback.weaknesses.map((w) => (
                            <div key={w} className="flex items-start gap-1.5 text-xs mb-1" style={{ color: "var(--text-2)" }}>
                              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--red)" }} />
                              {w}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Revision */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <RotateCcw className="w-4 h-4" style={{ color: "var(--gold)" }} />
                  Request AI Revision
                </h3>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder="Tell the AI what to change... e.g. 'Make the opening more specific', 'Add more impact details', 'Tighten the conclusion'"
                  className="input-dark w-full text-sm resize-none mb-3"
                />
                <button
                  onClick={handleRevise}
                  disabled={revising || !revisionNote.trim()}
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  {revising ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {revising ? "Revising..." : "Revise Essay"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem" }}>
              <FileText className="w-12 h-12 mb-4" style={{ color: "var(--border-2)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--text-2)" }}>No essay open</p>
              <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-3)" }}>
                Generate a new essay or open a saved draft from the left panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
