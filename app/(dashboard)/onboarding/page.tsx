"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Keyboard,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldCheck,
  Target,
  FileText,
  BookOpen,
} from "lucide-react";
import type { StudentProfile } from "@/lib/types";

const STEPS = [
  { id: 1, title: "Welcome to Audri", sub: "Let's build your scholarship profile" },
  { id: 2, title: "Your Education", sub: "Tell us where you are in your academic journey" },
  { id: 3, title: "Upload Your Resume", sub: "We'll extract your achievements automatically" },
  { id: 4, title: "Career Goals", sub: "What are you working toward?" },
  { id: 5, title: "All Set!", sub: "Your profile is ready to power your applications" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setProfile, completeOnboarding, setOnboardingStep, onboardingStep } = useAppStore();
  const [step, setStep] = useState(onboardingStep || 1);

  const [educationLevel, setEducationLevel] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [major, setMajor] = useState("");
  const [gpa, setGpa] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeMode, setResumeMode] = useState<"paste" | "skip">("paste");
  const [longTermGoals, setLongTermGoals] = useState("");
  const [careerInterests, setCareerInterests] = useState("");
  const [isFirstGen, setIsFirstGen] = useState<boolean | null>(null);
  const [financialNeed, setFinancialNeed] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);

  function goNext() {
    const next = step + 1;
    setStep(next);
    setOnboardingStep(next);
  }

  function goBack() {
    const prev = step - 1;
    setStep(prev);
    setOnboardingStep(prev);
  }

  async function handleResumeProcess() {
    if (!resumeText.trim() && resumeMode !== "skip") {
      toast.error("Please paste your resume text first.");
      return;
    }
    setAiProcessing(true);
    try {
      if (resumeText.trim()) {
        const res = await fetch("/api/ai/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: resumeText }),
        });
        if (res.ok) {
          toast.success("Resume parsed successfully!");
        } else {
          toast.info("Continuing without AI parsing — you can add details manually.");
        }
      }
      goNext();
    } catch {
      toast.info("Skipping AI parse — continuing manually.");
      goNext();
    } finally {
      setAiProcessing(false);
    }
  }

  async function handleFinish() {
    setAiProcessing(true);

    const profile: StudentProfile = {
      id: generateId("profile"),
      userId: user?.id ?? "",
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      schoolName: schoolName || undefined,
      educationLevel: (educationLevel as StudentProfile["educationLevel"]) || undefined,
      major: major || undefined,
      gpa: gpa ? parseFloat(gpa) : undefined,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      careerInterests: careerInterests.split(",").map((s) => s.trim()).filter(Boolean),
      longTermGoals: longTermGoals || undefined,
      isFirstGeneration: isFirstGen ?? undefined,
      financialNeedContext: financialNeed || undefined,
      demographics: [],
      languages: [],
      skills: [],
      certifications: [],
      achievements: [],
      stories: [],
      profileStrength: calculateInitialStrength(),
      profileStrengthBreakdown: {
        academics: educationLevel && gpa ? 70 : 20,
        leadership: 0, service: 0, workExperience: 0, awards: 0, storyDepth: 0,
        careerClarity: longTermGoals ? 60 : 10,
        financialNeedClarity: financialNeed ? 70 : 10,
        applicationReadiness: 10,
        recommendationReadiness: 0,
      },
      scholarshipPreferences: { categories: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProfile(profile);
    completeOnboarding();
    setAiProcessing(false);
    toast.success("Profile created! Paste your first scholarship.");
    router.push("/generate");
  }

  function calculateInitialStrength() {
    let score = 0;
    if (educationLevel) score += 15;
    if (schoolName) score += 10;
    if (major) score += 10;
    if (gpa) score += 10;
    if (resumeText.trim()) score += 20;
    if (longTermGoals) score += 15;
    if (careerInterests) score += 10;
    if (isFirstGen !== null) score += 5;
    if (financialNeed) score += 5;
    return Math.min(score, 100);
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const labelStyle = {
    color: "var(--text-3)",
    fontSize: "0.7rem",
    fontWeight: 600,
    display: "block" as const,
    marginBottom: "0.375rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div className="w-full max-w-2xl relative" style={{ zIndex: 1 }}>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center" style={{ boxShadow: "0 0 16px var(--gold-25)" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#080808" }} />
              </div>
              <span className="font-bold text-lg text-gradient">Audri</span>
            </div>
            <span className="text-sm" style={{ color: "var(--text-3)" }}>Step {step} of {STEPS.length}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
            <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{STEPS[step - 1].title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{STEPS[step - 1].sub}</p>
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                Audri is your scholarship command center. In the next few minutes, we&apos;ll build a
                profile that powers every application — so you never have to rewrite the same
                information twice.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Target, title: "Smart matching", desc: "Only scholarships you actually qualify for" },
                  { icon: FileText, title: "Essay drafts", desc: "From your real experiences — not templates" },
                  { icon: BookOpen, title: "Story Vault", desc: "Reusable narrative assets for any prompt" },
                  { icon: ShieldCheck, title: "100% authentic", desc: "We never fabricate your experiences" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center mb-2" style={{ background: "rgba(201,168,76,0.12)" }}>
                      <item.icon className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                    </div>
                    <div className="text-sm font-medium mb-0.5" style={{ color: "var(--text)" }}>{item.title}</div>
                    <div className="text-xs" style={{ color: "var(--text-3)" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={goNext} className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
                Let&apos;s build your profile <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Education level</label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="input-dark w-full text-sm">
                  <option value="">Select your level</option>
                  <option value="HIGH_SCHOOL">High School Student</option>
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="TRANSFER">Transfer Student</option>
                  <option value="GRADUATE">Graduate Student</option>
                  <option value="DOCTORAL">Doctoral Student</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>School name</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="University of Georgia" className="input-dark w-full text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Major / Field</label>
                  <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Computer Science" className="input-dark w-full text-sm" />
                </div>
                <div>
                  <label style={labelStyle}>GPA (optional)</label>
                  <input type="number" step="0.01" min="0" max="4.0" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="3.8" className="input-dark w-full text-sm" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Graduation year</label>
                <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2026" className="input-dark w-full text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="btn-ghost flex items-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goNext} className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Resume */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {[
                  { id: "paste", icon: Keyboard, label: "Paste resume" },
                  { id: "skip", icon: CheckCircle2, label: "Skip for now" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setResumeMode(mode.id as typeof resumeMode)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
                    style={{
                      background: resumeMode === mode.id ? "rgba(201,168,76,0.10)" : "var(--surface-2)",
                      border: resumeMode === mode.id ? "1px solid rgba(201,168,76,0.35)" : "1px solid var(--border)",
                      color: resumeMode === mode.id ? "var(--gold-light)" : "var(--text-2)",
                    }}
                  >
                    <mode.icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                ))}
              </div>

              {resumeMode === "paste" && (
                <div>
                  <label style={labelStyle}>Paste your resume text</label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                    placeholder="Paste your resume here — any format works. The AI will extract your achievements, experiences, skills, and awards automatically."
                    className="input-dark w-full text-sm resize-none font-mono"
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                    Processed by AI to extract structured data. You can edit the results anytime.
                  </p>
                </div>
              )}

              {resumeMode === "skip" && (
                <div className="rounded-xl p-4" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <p className="text-sm" style={{ color: "var(--gold-dark)" }}>No problem! You can add your resume and achievements manually from your profile page anytime.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="btn-ghost flex items-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={resumeMode === "skip" ? goNext : handleResumeProcess}
                  disabled={aiProcessing}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  {aiProcessing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing with AI...</>
                    : <>{resumeMode === "paste" && resumeText ? "Parse with AI" : "Continue"} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Career interests</label>
                <input type="text" value={careerInterests} onChange={(e) => setCareerInterests(e.target.value)} placeholder="Medicine, public health, research (comma-separated)" className="input-dark w-full text-sm" />
              </div>
              <div>
                <label style={labelStyle}>Long-term career goal</label>
                <textarea
                  value={longTermGoals}
                  onChange={(e) => setLongTermGoals(e.target.value)}
                  rows={3}
                  placeholder="Describe what you want to do with your career and why it matters to you..."
                  className="input-dark w-full text-sm resize-none"
                />
              </div>
              <div>
                <label style={labelStyle}>Are you a first-generation college student?</label>
                <div className="flex gap-3">
                  {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setIsFirstGen(opt.value)}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                      style={{
                        background: isFirstGen === opt.value ? "rgba(201,168,76,0.10)" : "var(--surface-2)",
                        border: isFirstGen === opt.value ? "1px solid rgba(201,168,76,0.35)" : "1px solid var(--border)",
                        color: isFirstGen === opt.value ? "var(--gold-light)" : "var(--text-2)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsFirstGen(null)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                  >
                    Prefer not to say
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Financial need context (optional)</label>
                <textarea
                  value={financialNeed}
                  onChange={(e) => setFinancialNeed(e.target.value)}
                  rows={2}
                  placeholder="Brief description of your financial situation, if relevant to your scholarship goals..."
                  className="input-dark w-full text-sm resize-none"
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                  Stored locally only. Used to improve your scholarship matching.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={goBack} className="btn-ghost flex items-center gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={goNext} className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto" style={{ boxShadow: "0 0 30px var(--gold-25)" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "#080808" }} />
              </div>
              <p className="leading-relaxed" style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
                Your scholarship profile is ready. Head to your dashboard to find scholarships,
                paste opportunities, generate essays, and track your applications.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { step: "Next →", action: "Paste a scholarship to analyze" },
                  { step: "Then →", action: "Build your Story Vault" },
                  { step: "Then →", action: "Generate your first essay" },
                  { step: "Always →", action: "Check your gap analysis" },
                ].map((item, i) => (
                  <div key={item.action} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: i === 0 ? "var(--gold)" : "var(--gold-dark)" }}>{item.step}</div>
                    <div className="text-sm" style={{ color: "var(--text-2)" }}>{item.action}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleFinish} disabled={aiProcessing} className="btn-gold w-full flex items-center justify-center gap-2 text-base">
                {aiProcessing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                  : <>Go to my dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
