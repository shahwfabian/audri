"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import {
  ClipboardList,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import type { Resume, ResumeSection, ResumeType } from "@/lib/types";

const RESUME_TYPES: { value: ResumeType; label: string; desc: string }[] = [
  { value: "SCHOLARSHIP", label: "Scholarship Resume", desc: "Emphasizes achievements, leadership, and service" },
  { value: "COLLEGE", label: "College Application", desc: "Balanced overview for admissions" },
  { value: "INTERNSHIP", label: "Internship Resume", desc: "Highlights skills and relevant experience" },
  { value: "RESEARCH", label: "Research Resume", desc: "Academic and research-focused" },
  { value: "LEADERSHIP", label: "Leadership Resume", desc: "Showcases leadership roles and impact" },
  { value: "SERVICE", label: "Community Service", desc: "Volunteer work and community impact" },
];

function buildResumeFromProfile(profile: ReturnType<typeof useAppStore.getState>["profile"], type: ResumeType): Resume {
  if (!profile) throw new Error("No profile");

  const sections: ResumeSection[] = [];

  sections.push({
    id: generateId("sec"), type: "HEADER", title: "Header", order: 0,
    items: [{
      id: generateId("item"), title: profile.fullName,
      organization: [profile.schoolName, profile.major].filter(Boolean).join(" · "),
      bullets: [profile.email, profile.location ?? "", profile.gpa ? `GPA: ${profile.gpa}` : ""].filter(Boolean),
    }],
  });

  if (profile.schoolName) {
    sections.push({
      id: generateId("sec"), type: "EDUCATION", title: "Education", order: 1,
      items: [{
        id: generateId("item"), title: profile.schoolName,
        organization: profile.major ?? undefined,
        endDate: profile.graduationYear?.toString(),
        bullets: [
          profile.gpa ? `GPA: ${profile.gpa}` : "",
          profile.testScores?.map(s => `${s.type}: ${s.score}`).join(", ") ?? "",
        ].filter(Boolean),
      }],
    });
  }

  const leadershipAch = profile.achievements.filter(a => ["LEADERSHIP", "ENTREPRENEURSHIP"].includes(a.category));
  if (leadershipAch.length > 0) {
    sections.push({
      id: generateId("sec"), type: "LEADERSHIP", title: "Leadership", order: 2,
      items: leadershipAch.map(a => ({
        id: generateId("item"), title: a.role ?? a.title,
        organization: a.organization, startDate: a.startDate, endDate: a.endDate ?? "Present",
        bullets: [a.description ?? "", a.impact ?? "", ...a.metrics].filter(Boolean),
      })),
    });
  }

  const workAch = profile.achievements.filter(a => a.category === "WORK");
  if (workAch.length > 0) {
    sections.push({
      id: generateId("sec"), type: "EXPERIENCE", title: "Work Experience", order: 3,
      items: workAch.map(a => ({
        id: generateId("item"), title: a.role ?? a.title,
        organization: a.organization, startDate: a.startDate, endDate: a.endDate ?? "Present",
        bullets: [a.description ?? "", a.impact ?? ""].filter(Boolean),
      })),
    });
  }

  const serviceAch = profile.achievements.filter(a => a.category === "SERVICE");
  if (serviceAch.length > 0) {
    sections.push({
      id: generateId("sec"), type: "SERVICE", title: "Community Service", order: 4,
      items: serviceAch.map(a => ({
        id: generateId("item"), title: a.title,
        organization: a.organization, startDate: a.startDate, endDate: a.endDate ?? "Present",
        bullets: [a.description ?? "", a.impact ?? ""].filter(Boolean),
      })),
    });
  }

  const awardAch = profile.achievements.filter(a => ["AWARD", "ACADEMICS", "RESEARCH"].includes(a.category));
  if (awardAch.length > 0) {
    sections.push({
      id: generateId("sec"), type: "AWARDS", title: "Awards & Honors", order: 5,
      items: awardAch.map(a => ({
        id: generateId("item"), title: a.title,
        organization: a.organization, startDate: a.startDate,
        bullets: [a.description ?? ""].filter(Boolean),
      })),
    });
  }

  if (profile.skills.length > 0 || profile.languages.length > 0) {
    sections.push({
      id: generateId("sec"), type: "SKILLS", title: "Skills", order: 6,
      items: [{
        id: generateId("item"), title: "Skills & Languages",
        bullets: [
          profile.skills.length ? `Skills: ${profile.skills.join(", ")}` : "",
          profile.languages.length > 1 ? `Languages: ${profile.languages.join(", ")}` : "",
        ].filter(Boolean),
      }],
    });
  }

  return {
    id: generateId("resume"),
    profileId: profile.id,
    title: `${RESUME_TYPES.find(t => t.value === type)?.label ?? "Resume"} — ${profile.fullName}`,
    type, sections,
    template: "clean",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function ResumePreview({ resume }: { resume: Resume }) {
  return (
    <div className="rounded-xl border p-8 font-mono text-xs leading-relaxed" style={{ background: "#F8F6F0", border: "1px solid #D4C89A", color: "#1A1200" }}>
      {resume.sections.map(section => (
        <div key={section.id} className="mb-5">
          {section.type === "HEADER" ? (
            section.items.map(item => (
              <div key={item.id} className="text-center mb-4">
                <h1 className="text-lg font-bold font-sans" style={{ color: "#0D0900" }}>{item.title}</h1>
                {item.organization && <p className="text-xs font-sans" style={{ color: "#4A3A10" }}>{item.organization}</p>}
                <p className="text-xs font-sans" style={{ color: "#6B5A30" }}>{item.bullets.join(" · ")}</p>
              </div>
            ))
          ) : (
            <>
              <div className="pb-0.5 mb-2" style={{ borderBottom: "1px solid #C9A84C" }}>
                <h2 className="font-bold uppercase tracking-wider text-xs font-sans" style={{ color: "#3D2B00" }}>{section.title}</h2>
              </div>
              {section.items.map(item => (
                <div key={item.id} className="mb-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold" style={{ color: "#1A1200" }}>{item.title}</span>
                    {(item.startDate || item.endDate) && (
                      <span className="text-xs" style={{ color: "#6B5A30" }}>
                        {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {item.organization && (
                    <div className="italic text-xs" style={{ color: "#4A3A10" }}>{item.organization}</div>
                  )}
                  {item.bullets.map((b, i) => b ? (
                    <div key={i} className="flex items-start gap-1.5 mt-0.5" style={{ color: "#2A1E00" }}>
                      <span className="mt-0.5" style={{ color: "#C9A84C" }}>•</span>
                      <span>{b}</span>
                    </div>
                  ) : null)}
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ResumePage() {
  const { profile } = useAppStore();
  const [selectedType, setSelectedType] = useState<ResumeType>("SCHOLARSHIP");
  const [resume, setResume] = useState<Resume | null>(null);
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    if (!profile) { toast.error("Complete your profile first."); return; }
    if (profile.achievements.length === 0) { toast.error("Add some achievements to your profile before generating a resume."); return; }
    setGenerating(true);
    setTimeout(() => {
      try {
        const r = buildResumeFromProfile(profile, selectedType);
        setResume(r);
        toast.success("Resume generated from your profile!");
      } catch {
        toast.error("Could not build resume.");
      } finally {
        setGenerating(false);
      }
    }, 600);
  }

  function handleCopy() {
    if (!resume) return;
    const text = resume.sections.map(s => {
      const header = s.type === "HEADER" ? "" : `\n${s.title.toUpperCase()}\n${"─".repeat(40)}\n`;
      const items = s.items.map(item =>
        `${item.title}${item.organization ? ` | ${item.organization}` : ""}${item.endDate ? ` (${item.startDate ?? ""}–${item.endDate})` : ""}\n${item.bullets.map(b => `  • ${b}`).join("\n")}`
      ).join("\n");
      return header + items;
    }).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Resume copied as plain text!");
  }

  const hasAchievements = (profile?.achievements.length ?? 0) > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Resume Builder</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Generate a polished resume from your scholarship profile in seconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Resume type */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Resume Type</h2>
            <div className="space-y-2">
              {RESUME_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{
                    background: selectedType === type.value ? "rgba(201,168,76,0.10)" : "var(--surface-2)",
                    border: selectedType === type.value ? "1px solid rgba(201,168,76,0.35)" : "1px solid var(--border)",
                    color: selectedType === type.value ? "var(--gold-light)" : "var(--text-2)",
                  }}
                >
                  <div className="font-medium text-xs">{type.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: selectedType === type.value ? "var(--gold-dark)" : "var(--text-3)" }}>{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Profile check */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>Profile Completeness</h2>
            <div className="space-y-2">
              {[
                { label: "Basic information", done: !!profile?.fullName },
                { label: "Education", done: !!profile?.schoolName },
                { label: "Achievements added", done: hasAchievements },
                { label: "Career goals", done: !!profile?.longTermGoals },
                { label: "Skills", done: (profile?.skills?.length ?? 0) > 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.done
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--green)" }} />
                    : <div className="w-3.5 h-3.5 rounded-full" style={{ border: "1.5px solid var(--border-2)" }} />}
                  <span style={{ color: item.done ? "var(--text-2)" : "var(--text-3)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating || !profile} className="btn-gold w-full flex items-center justify-center gap-2 text-sm">
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Building...</>
              : <><Sparkles className="w-4 h-4" /> Generate Resume</>}
          </button>

          {resume && (
            <button onClick={handleCopy} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
              <Copy className="w-4 h-4" />
              Copy as Plain Text
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {resume ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{resume.title}</h2>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {resume.sections.reduce((n, s) => n + s.items.length, 0)} entries
                </span>
              </div>
              <ResumePreview resume={resume} />
              <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
                Generated from your profile. Edit your profile to update it.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <ClipboardList className="w-12 h-12 mb-4" style={{ color: "var(--border-2)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--text-2)" }}>No resume generated yet</p>
              <p className="text-sm max-w-xs text-center" style={{ color: "var(--text-3)" }}>
                {!profile
                  ? "Complete your profile first."
                  : !hasAchievements
                  ? "Add achievements to your profile, then generate your resume."
                  : "Select a resume type and click Generate."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
