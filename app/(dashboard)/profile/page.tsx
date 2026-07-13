"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import {
 User,
 GraduationCap,
 Trophy,
 Loader2,
 Sparkles,
 Plus,
 X,
 Edit2,
 Save,
 ShieldCheck,
 CheckCircle2,
} from "lucide-react";
import type { Achievement, AchievementCategory, StudentProfile } from "@/lib/types";

const CATEGORY_OPTIONS: { value: AchievementCategory; label: string }[] = [
 { value: "LEADERSHIP", label: "Leadership" },
 { value: "ACADEMICS", label: "Academics" },
 { value: "SERVICE", label: "Community Service" },
 { value: "ATHLETICS", label: "Athletics" },
 { value: "ARTS", label: "Arts" },
 { value: "WORK", label: "Work Experience" },
 { value: "RESEARCH", label: "Research" },
 { value: "ENTREPRENEURSHIP",label: "Entrepreneurship" },
 { value: "AWARD", label: "Award / Honor" },
 { value: "CERTIFICATION", label: "Certification" },
 { value: "OTHER", label: "Other" },
];

const EDUCATION_LEVELS = [
 { value: "HIGH_SCHOOL", label: "High School" },
 { value: "UNDERGRADUATE", label: "Undergraduate" },
 { value: "GRADUATE", label: "Graduate" },
 { value: "DOCTORAL", label: "Doctoral / PhD" },
 { value: "TRANSFER", label: "Transfer Student" },
];

const INCOME_LEVELS = [
 { value: "UNDER_30K", label: "Under $30,000" },
 { value: "30K_60K", label: "$30,000, $60,000" },
 { value: "60K_100K", label: "$60,000, $100,000" },
 { value: "OVER_100K", label: "Over $100,000" },
];

const DEMOGRAPHIC_OPTIONS = [
 "Women", "Hispanic / Latino", "Black / African American",
 "Asian / Pacific Islander", "Native American / Alaska Native",
 "LGBTQ+", "Military Family", "Disability",
];

const US_STATES = [
 "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
 "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
 "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
 "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
 "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
 "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
 "Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington D.C.",
];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
 return (
 <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
 <h2 className="font-semibold flex items-center gap-2 mb-5 text-sm uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
 <Icon className="w-4 h-4" style={{ color: "var(--gold)" }} />
 {title}
 </h2>
 {children}
 </div>
 );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
 return <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>{children}</label>;
}

function FieldValue({ children }: { children: React.ReactNode }) {
 return <p className="text-sm" style={{ color: children ? "var(--text)" : "var(--text-3)" }}>{children || "Not set"}</p>;
}

export default function ProfilePage() {
 const { profile, user, updateProfile } = useAppStore();
 const [uploading, setUploading] = useState(false);
 const [resumeText, setResumeText] = useState("");
 const [showResumeInput, setShowResumeInput] = useState(false);
 const [showAddAchievement, setShowAddAchievement] = useState(false);
 const [editingBasic, setEditingBasic] = useState(false);
 const [editingEligibility, setEditingEligibility] = useState(false);

 // Basic info
 const [name, setName] = useState(profile?.fullName ?? "");
 const [school, setSchool] = useState(profile?.schoolName ?? "");
 const [major, setMajor] = useState(profile?.major ?? "");
 const [gpa, setGpa] = useState(profile?.gpa?.toString() ?? "");
 const [goals, setGoals] = useState(profile?.longTermGoals ?? "");
 const [careers, setCareers] = useState(profile?.careerInterests?.join(", ") ?? "");

 // Eligibility fields
 const [state, setState] = useState((profile as { state?: string })?.state ?? "");
 const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "");
 const [incomeLevel, setIncomeLevel] = useState((profile as { incomeLevel?: string })?.incomeLevel ?? "");
 const [isFirstGen, setIsFirstGen] = useState(profile?.isFirstGeneration ?? false);
 const [isInternational, setIsInternational] = useState(profile?.isInternational ?? false);
 const [citizenship, setCitizenship] = useState(profile?.citizenship ?? "");
 const [selectedDemographics, setSelectedDemographics] = useState<string[]>(profile?.demographics ?? []);

 // Keep the form state in lockstep with the stored profile, when the
 // profile changes (login, resume parse, onboarding) and we're not mid-edit,
 // re-seed every field so the page NEVER shows stale data.
 useEffect(() => {
 if (!editingBasic) {
 setName(profile?.fullName ?? "");
 setSchool(profile?.schoolName ?? "");
 setMajor(profile?.major ?? "");
 setGpa(profile?.gpa?.toString() ?? "");
 setGoals(profile?.longTermGoals ?? "");
 setCareers(profile?.careerInterests?.join(", ") ?? "");
 }
 if (!editingEligibility) {
 setState((profile as { state?: string })?.state ?? "");
 setEducationLevel(profile?.educationLevel ?? "");
 setIncomeLevel((profile as { incomeLevel?: string })?.incomeLevel ?? "");
 setIsFirstGen(profile?.isFirstGeneration ?? false);
 setIsInternational(profile?.isInternational ?? false);
 setCitizenship(profile?.citizenship ?? "");
 setSelectedDemographics(profile?.demographics ?? []);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [profile]);

 // Achievement form
 const [achTitle, setAchTitle] = useState("");
 const [achCategory, setAchCategory] = useState<AchievementCategory>("LEADERSHIP");
 const [achOrg, setAchOrg] = useState("");
 const [achRole, setAchRole] = useState("");
 const [achDesc, setAchDesc] = useState("");
 const [achImpact, setAchImpact] = useState("");
 const [achStart, setAchStart] = useState("");
 const [achEnd, setAchEnd] = useState("");

 async function handleResumeUpload() {
 if (!resumeText.trim()) { toast.error("Paste your resume text first."); return; }
 setUploading(true);
 try {
 const res = await fetch("/api/ai/parse-resume", {
 method: "POST",
 headers: { "Content-Type": "application/json", ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
 body: JSON.stringify({ text: resumeText }),
 });
 if (!res.ok) throw new Error();
 const data = await res.json();
 updateProfile({ ...data.profile, achievements: [...(profile?.achievements ?? []), ...data.achievements] });
 setResumeText("");
 setShowResumeInput(false);
 toast.success(`Profile updated! ${data.achievements.length} achievements extracted.`);
 } catch {
 toast.error("Could not parse resume. Check your API key.");
 } finally {
 setUploading(false);
 }
 }

 function saveBasicInfo() {
 updateProfile({
 fullName: name,
 schoolName: school,
 major,
 gpa: gpa ? parseFloat(gpa) : undefined,
 longTermGoals: goals,
 careerInterests: careers.split(",").map((s) => s.trim()).filter(Boolean),
 });
 setEditingBasic(false);
 toast.success("Profile updated.");
 }

 function saveEligibility() {
 updateProfile({
 state,
 educationLevel: (educationLevel as StudentProfile["educationLevel"]) || undefined,
 incomeLevel,
 isFirstGeneration: isFirstGen,
 isInternational,
 citizenship,
 demographics: selectedDemographics,
 });
 setEditingEligibility(false);
 toast.success("Eligibility profile saved.");
 }

 function toggleDemographic(d: string) {
 setSelectedDemographics(prev =>
 prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
 );
 }

 function addAchievement() {
 if (!achTitle) { toast.error("Title is required."); return; }
 const achievement: Achievement = {
 id: generateId("ach"),
 title: achTitle,
 category: achCategory,
 organization: achOrg || undefined,
 role: achRole || undefined,
 description: achDesc || undefined,
 impact: achImpact || undefined,
 startDate: achStart || undefined,
 endDate: achEnd || undefined,
 metrics: [],
 relatedStories: [],
 essayUseCases: [],
 isActive: true,
 createdAt: new Date().toISOString(),
 };
 updateProfile({ achievements: [...(profile?.achievements ?? []), achievement] });
 setAchTitle(""); setAchCategory("LEADERSHIP"); setAchOrg(""); setAchRole("");
 setAchDesc(""); setAchImpact(""); setAchStart(""); setAchEnd("");
 setShowAddAchievement(false);
 toast.success("Achievement added.");
 }

 function removeAchievement(id: string) {
 updateProfile({ achievements: (profile?.achievements ?? []).filter((a) => a.id !== id) });
 }

 const achievements = profile?.achievements ?? [];
 const profileState = (profile as { state?: string })?.state;
 const profileIncome = (profile as { incomeLevel?: string })?.incomeLevel;

 const eligibilityComplete = !!(profileState && profile?.educationLevel && profile?.major);

 return (
 <div className="max-w-4xl mx-auto space-y-5">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Profile</h1>
 <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Your scholarship knowledge graph, the foundation of every application.</p>
 </div>
 <div className="text-right">
 <div className="text-3xl font-bold text-gradient">{profile?.profileStrength ?? 0}%</div>
 <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Profile strength</div>
 </div>
 </div>

 {/* Resume import */}
 <div className="rounded-2xl border p-5" style={{ background: "var(--gold-10)", borderColor: "var(--gold-25)" }}>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <Sparkles className="w-4 h-4" style={{ color: "var(--gold)" }} />
 <span className="font-semibold text-sm" style={{ color: "var(--gold-light)" }}>Import from Resume</span>
 </div>
 <button onClick={() => setShowResumeInput(!showResumeInput)} className="text-xs font-medium hover:underline" style={{ color: "var(--gold)" }}>
 {showResumeInput ? "Cancel" : "Paste Resume"}
 </button>
 </div>
 <p className="text-xs" style={{ color: "var(--gold-dark)" }}>Paste your resume text and AI will extract all your achievements, skills, and education automatically.</p>

 {showResumeInput && (
 <div className="mt-4 space-y-3">
 <textarea
 value={resumeText}
 onChange={(e) => setResumeText(e.target.value)}
 rows={8}
 placeholder="Paste your resume text here..."
 className="input-dark w-full px-3 py-2.5 text-sm resize-none font-mono"
 />
 <button onClick={handleResumeUpload} disabled={uploading} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
 {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
 {uploading ? "Parsing..." : "Parse with AI"}
 </button>
 </div>
 )}
 </div>

 {/* Eligibility Profile, NEW */}
 <SectionCard title="Eligibility Profile" icon={ShieldCheck}>
 <div className="flex items-center justify-between mb-5">
 <div className="flex items-center gap-2">
 {eligibilityComplete ? (
 <span className="badge-green text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
 <CheckCircle2 className="w-3 h-3" /> Complete, personalized matching active
 </span>
 ) : (
 <span className="badge-amber text-xs px-2.5 py-1 rounded-full font-medium">
 Incomplete, fill this in to see personalized matches
 </span>
 )}
 </div>
 <button
 onClick={() => editingEligibility ? saveEligibility() : setEditingEligibility(true)}
 className={editingEligibility ? "btn-gold flex items-center gap-1.5 text-xs px-3 py-1.5" : "btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5"}
 >
 {editingEligibility ? <><Save className="w-3 h-3" /> Save</> : <><Edit2 className="w-3 h-3" /> Edit</>}
 </button>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <FieldLabel>State / Territory</FieldLabel>
 {editingEligibility ? (
 <select value={state} onChange={(e) => setState(e.target.value)} className="input-dark w-full px-3 py-2 text-sm">
 <option value="">Select state…</option>
 {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 ) : <FieldValue>{profileState}</FieldValue>}
 </div>

 <div>
 <FieldLabel>Education Level</FieldLabel>
 {editingEligibility ? (
 <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="input-dark w-full px-3 py-2 text-sm">
 <option value="">Select level…</option>
 {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
 </select>
 ) : <FieldValue>{EDUCATION_LEVELS.find(l => l.value === profile?.educationLevel)?.label}</FieldValue>}
 </div>

 <div>
 <FieldLabel>Household Income Bracket</FieldLabel>
 {editingEligibility ? (
 <select value={incomeLevel} onChange={(e) => setIncomeLevel(e.target.value)} className="input-dark w-full px-3 py-2 text-sm">
 <option value="">Select bracket…</option>
 {INCOME_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
 </select>
 ) : <FieldValue>{INCOME_LEVELS.find(l => l.value === profileIncome)?.label}</FieldValue>}
 </div>

 <div>
 <FieldLabel>Citizenship Status</FieldLabel>
 {editingEligibility ? (
 <select value={citizenship} onChange={(e) => setCitizenship(e.target.value)} className="input-dark w-full px-3 py-2 text-sm">
 <option value="">Select…</option>
 <option value="US_CITIZEN">U.S. Citizen</option>
 <option value="PERMANENT_RESIDENT">Permanent Resident</option>
 <option value="DACA">DACA Recipient</option>
 <option value="INTERNATIONAL">International Student</option>
 <option value="OTHER">Other</option>
 </select>
 ) : <FieldValue>{citizenship}</FieldValue>}
 </div>
 </div>

 <div className="mt-4 grid md:grid-cols-2 gap-4">
 <label className="flex items-center gap-3 cursor-pointer">
 <div
 onClick={() => editingEligibility && setIsFirstGen(!isFirstGen)}
 className="w-10 h-5 rounded-full transition-colors cursor-pointer relative"
 style={{ background: isFirstGen ? "var(--gold)" : "var(--border-2)" }}
 >
 <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all bg-white" style={{ left: isFirstGen ? "calc(100% - 18px)" : "2px" }} />
 </div>
 <span className="text-sm" style={{ color: "var(--text-2)" }}>First-generation college student</span>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <div
 onClick={() => editingEligibility && setIsInternational(!isInternational)}
 className="w-10 h-5 rounded-full transition-colors cursor-pointer relative"
 style={{ background: isInternational ? "var(--gold)" : "var(--border-2)" }}
 >
 <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all bg-white" style={{ left: isInternational ? "calc(100% - 18px)" : "2px" }} />
 </div>
 <span className="text-sm" style={{ color: "var(--text-2)" }}>International student</span>
 </label>
 </div>

 <div className="mt-4">
 <FieldLabel>Demographics</FieldLabel>
 <div className="flex flex-wrap gap-2 mt-1">
 {DEMOGRAPHIC_OPTIONS.map((d) => {
 const active = editingEligibility ? selectedDemographics.includes(d) : profile?.demographics?.includes(d);
 return (
 <button
 key={d}
 onClick={() => editingEligibility && toggleDemographic(d)}
 disabled={!editingEligibility}
 className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
 style={{
 background: active ? "var(--gold-10)" : "var(--surface-2)",
 borderColor: active ? "var(--gold-25)" : "var(--border-2)",
 color: active ? "var(--gold-light)" : "var(--text-2)",
 cursor: editingEligibility ? "pointer" : "default",
 }}
 >
 {d}
 </button>
 );
 })}
 </div>
 </div>
 </SectionCard>

 {/* Basic info */}
 <SectionCard title="Basic Information" icon={User}>
 <div className="flex justify-end mb-4">
 <button
 onClick={() => editingBasic ? saveBasicInfo() : setEditingBasic(true)}
 className={editingBasic ? "btn-gold flex items-center gap-1.5 text-xs px-3 py-1.5" : "btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5"}
 >
 {editingBasic ? <><Save className="w-3 h-3" /> Save</> : <><Edit2 className="w-3 h-3" /> Edit</>}
 </button>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 {[
 { label: "Full name", value: name, setter: setName, placeholder: "Alex Johnson" },
 { label: "School / University", value: school, setter: setSchool, placeholder: "University of Georgia" },
 { label: "Major / Field", value: major, setter: setMajor, placeholder: "Computer Science" },
 { label: "GPA", value: gpa, setter: setGpa, placeholder: "3.8" },
 ].map((field) => (
 <div key={field.label}>
 <FieldLabel>{field.label}</FieldLabel>
 {editingBasic ? (
 <input
 value={field.value}
 onChange={(e) => field.setter(e.target.value)}
 placeholder={field.placeholder}
 className="input-dark w-full px-3 py-2 text-sm"
 />
 ) : (
 <FieldValue>{field.value}</FieldValue>
 )}
 </div>
 ))}
 </div>

 <div className="mt-4">
 <FieldLabel>Career interests (comma-separated)</FieldLabel>
 {editingBasic ? (
 <input value={careers} onChange={(e) => setCareers(e.target.value)} placeholder="Medicine, public health, research" className="input-dark w-full px-3 py-2 text-sm" />
 ) : (
 <div className="flex flex-wrap gap-1.5">
 {profile?.careerInterests?.length ? (
 profile.careerInterests.map((c) => (
 <span key={c} className="badge-gold text-xs px-2.5 py-1 rounded-full">{c}</span>
 ))
 ) : (
 <span className="text-sm" style={{ color: "var(--text-3)" }}>Not set</span>
 )}
 </div>
 )}
 </div>

 <div className="mt-4">
 <FieldLabel>Long-term career goal</FieldLabel>
 {editingBasic ? (
 <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} placeholder="Describe your long-term career vision..." className="input-dark w-full px-3 py-2 text-sm resize-none" />
 ) : (
 <FieldValue>{goals}</FieldValue>
 )}
 </div>
 </SectionCard>

 {/* Achievements */}
 <SectionCard title="Achievements & Experiences" icon={Trophy}>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs px-2 py-0.5 rounded-full badge-gray">{achievements.length} entries</span>
 <button onClick={() => setShowAddAchievement(!showAddAchievement)} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5">
 <Plus className="w-3 h-3" /> Add Achievement
 </button>
 </div>

 {showAddAchievement && (
 <div className="mb-4 rounded-xl p-4 space-y-3 border" style={{ background: "var(--surface-2)", borderColor: "var(--border-2)" }}>
 <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>New Achievement</h3>
 <div className="grid md:grid-cols-2 gap-3">
 {[
 { label: "Title *", value: achTitle, setter: setAchTitle, placeholder: "President, Debate Club" },
 { label: "Organization", value: achOrg, setter: setAchOrg, placeholder: "School, Company, etc." },
 { label: "Your role", value: achRole, setter: setAchRole, placeholder: "President, Volunteer, Intern" },
 ].map((f) => (
 <div key={f.label}>
 <FieldLabel>{f.label}</FieldLabel>
 <input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} className="input-dark w-full px-3 py-2 text-sm" />
 </div>
 ))}
 <div>
 <FieldLabel>Category</FieldLabel>
 <select value={achCategory} onChange={(e) => setAchCategory(e.target.value as AchievementCategory)} className="input-dark w-full px-3 py-2 text-sm">
 {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 </div>
 <div>
 <FieldLabel>Start date</FieldLabel>
 <input value={achStart} onChange={(e) => setAchStart(e.target.value)} placeholder="2022" className="input-dark w-full px-3 py-2 text-sm" />
 </div>
 <div>
 <FieldLabel>End date</FieldLabel>
 <input value={achEnd} onChange={(e) => setAchEnd(e.target.value)} placeholder="Present" className="input-dark w-full px-3 py-2 text-sm" />
 </div>
 </div>
 <div>
 <FieldLabel>Description</FieldLabel>
 <textarea value={achDesc} onChange={(e) => setAchDesc(e.target.value)} rows={2} placeholder="What did you do?" className="input-dark w-full px-3 py-2 text-sm resize-none" />
 </div>
 <div>
 <FieldLabel>Impact</FieldLabel>
 <textarea value={achImpact} onChange={(e) => setAchImpact(e.target.value)} rows={2} placeholder="What changed? Include numbers if possible." className="input-dark w-full px-3 py-2 text-sm resize-none" />
 </div>
 <div className="flex gap-2">
 <button onClick={addAchievement} className="btn-gold flex items-center gap-1.5 px-4 py-2 text-sm">
 <Plus className="w-3.5 h-3.5" /> Add Achievement
 </button>
 <button onClick={() => setShowAddAchievement(false)} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
 </div>
 </div>
 )}

 {achievements.length === 0 ? (
 <div className="text-center py-10 text-sm" style={{ color: "var(--text-3)" }}>
 No achievements yet. Add one manually or paste your resume above.
 </div>
 ) : (
 <div className="space-y-3">
 {achievements.map((ach) => (
 <div key={ach.id} className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="badge-gray text-xs px-2 py-0.5 rounded-full">
 {CATEGORY_OPTIONS.find((o) => o.value === ach.category)?.label ?? ach.category}
 </span>
 </div>
 <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{ach.title}</div>
 {ach.organization && <div className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>{ach.organization}{ach.role ? ` · ${ach.role}` : ""}</div>}
 {ach.description && <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>{ach.description}</p>}
 {ach.impact && (
 <p className="text-xs mt-1 font-medium" style={{ color: "var(--green)" }}>Impact: {ach.impact}</p>
 )}
 {(ach.startDate || ach.endDate) && (
 <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{ach.startDate ?? ""}{ach.endDate ? `, ${ach.endDate}` : ""}</p>
 )}
 </div>
 <button onClick={() => removeAchievement(ach.id)} className="shrink-0 mt-0.5 transition-colors" style={{ color: "var(--text-3)" }}
 onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
 onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </SectionCard>
 </div>
 );
}
