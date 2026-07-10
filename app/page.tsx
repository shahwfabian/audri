"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, BookOpen, Zap, BarChart3, FileText, Sparkles, Trophy, Search, Clock, Brain, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const features = [
 {
 icon: Brain,
 title: "Student Knowledge Graph",
 description: "Upload your resume or speak naturally. Audri builds a structured profile of every achievement, story, and strength, stored once, reused everywhere.",
 },
 {
 icon: Search,
 title: "Eligibility-First Discovery",
 description: "Only see scholarships you actually qualify for. Hard eligibility gates filter by GPA, major, state, demographics, and more, before you waste a single minute.",
 },
 {
 icon: FileText,
 title: "Essay Generation Engine",
 description: "Audri drafts scholarship essays from your real stories, not generic templates. Every essay is tailored to the specific prompt, scholarship, and your voice.",
 },
 {
 icon: BarChart3,
 title: "Match & ROI Scores",
 description: "See exactly which scholarships are worth your time. Match Score tells you fit. ROI Score shows expected value per hour spent applying.",
 },
 {
 icon: BookOpen,
 title: "Story Vault",
 description: "Your experiences become reusable narrative assets, challenge stories, leadership stories, community stories, ready for any application.",
 },
 {
 icon: Zap,
 title: "Gap Analysis",
 description: "Identify exactly what's missing from your profile and how to fix it. Stop guessing why you're not winning. Start building what scholarship committees want.",
 },
];

const stats = [
 { value: "50+DC", label: "States with local scholarships built in" },
 { value: "8", label: "Scholarship sources aggregated" },
 { value: "0", label: "Fabricated experiences, ever" },
 { value: "1", label: "Profile that powers every application" },
];

// Honest capability statements, no invented students, no invented awards.
const highlights = [
 {
 quote: "Paste an entire scholarship page, or just the link, and Audri reads it, researches the funder, and drafts your essay from your real profile.",
 name: "Flagship: the essay generator",
 detail: "Built on the show-don't-tell methodology from Accepted! 50 Successful Essays",
 },
 {
 quote: "Every state's flagship aid program is built in, so a student anywhere sees the local money that's dramatically less competitive than national awards.",
 name: "Local-first discovery",
 detail: "All 50 states + DC, plus BigFuture, Bold.org, Scholarship America and more",
 },
 {
 quote: "Your profile is encrypted and tied to your account alone. No fabricated stories, no shared data, no essays written from anyone's life but yours.",
 name: "Accuracy and privacy by design",
 detail: "AES-256 encryption · strict per-account isolation",
 },
];

export default function LandingPage() {
 const router = useRouter();
 const { isLoggedIn, _hasHydrated } = useAppStore();

 // The website pops open to the flagship: signed-in students never see
 // marketing, they land directly in the Essay Generator.
 useEffect(() => {
 if (_hasHydrated && isLoggedIn) router.replace("/generate");
 }, [_hasHydrated, isLoggedIn, router]);

 return (
 <div className="min-h-screen" style={{ background: "var(--bg)" }}>
 {/* Ambient background glow */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-[0.07]" style={{ background: "radial-gradient(ellipse, var(--gold) 0%, transparent 70%)" }} />
 </div>

 {/* Nav */}
 <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ borderColor: "var(--border)", background: "rgba(8,8,8,0.85)" }}>
 <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
 <Sparkles className="w-4 h-4" style={{ color: "#080808" }} />
 </div>
 <span className="font-bold text-xl" style={{ color: "var(--text)" }}>Audri</span>
 </div>
 <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--text-2)" }}>
 <a href="#features" className="hover:text-[var(--gold)] transition-colors">Features</a>
 <a href="#how-it-works" className="hover:text-[var(--gold)] transition-colors">How it works</a>
 <a href="#highlights" className="hover:text-[var(--gold)] transition-colors">Features</a>
 </div>
 <div className="flex items-center gap-3">
 <Link href="/login" className="text-sm transition-colors hover:text-[var(--gold)]" style={{ color: "var(--text-2)" }}>
 Sign in
 </Link>
 <Link href="/signup" className="btn-gold text-sm px-5 py-2.5">
 Get started free
 </Link>
 </div>
 </div>
 </nav>

 {/* Hero */}
 <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-10 badge-gold">
 <Sparkles className="w-3.5 h-3.5" />
 AI-Powered Scholarship Intelligence Platform
 </div>

 <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
 <span style={{ color: "var(--text)" }}>One profile.</span>
 <br />
 <span className="text-gradient">Every scholarship.</span>
 <br />
 <span style={{ color: "var(--text)" }}>Every essay.</span>
 </h1>

 <p className="text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "var(--text-2)" }}>
 Audri discovers scholarships you actually qualify for, matches them to your profile,
 and helps you win, from one command center built for serious applicants.
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/signup"
 className="btn-gold flex items-center gap-2 px-10 py-4 text-base"
 style={{ borderRadius: "var(--radius-lg)" }}
 >
 Build your scholarship profile
 <ArrowRight className="w-5 h-5" />
 </Link>
 <Link
 href="/login"
 className="btn-ghost flex items-center gap-2 px-10 py-4 text-base"
 style={{ borderRadius: "var(--radius-lg)" }}
 >
 Sign in
 </Link>
 </div>

 <p className="text-sm mt-4" style={{ color: "var(--text-3)" }}>
 Free to start. No credit card required.
 </p>
 </motion.div>

 {/* Stats */}
 <motion.div
 initial={{ opacity: 0, y: 32 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.25 }}
 className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-16"
 style={{ borderTop: "1px solid var(--border)" }}
 >
 {stats.map((stat) => (
 <div key={stat.value} className="text-center">
 <div className="text-4xl font-bold mb-1 text-gradient">{stat.value}</div>
 <div className="text-sm" style={{ color: "var(--text-2)" }}>{stat.label}</div>
 </div>
 ))}
 </motion.div>
 </section>

 {/* Dashboard preview */}
 <section className="relative z-10 py-20" style={{ background: "var(--surface)" }}>
 <div className="max-w-5xl mx-auto px-6">
 <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border-2)" }}>
 {/* Window bar */}
 <div className="gradient-brand px-6 py-4 flex items-center gap-3">
 <div className="flex gap-1.5">
 <div className="w-3 h-3 rounded-full bg-black/20" />
 <div className="w-3 h-3 rounded-full bg-black/20" />
 <div className="w-3 h-3 rounded-full bg-black/20" />
 </div>
 <div className="flex-1 text-center text-black/60 text-sm font-semibold">Audri, Scholarship Command Center <span className="font-normal opacity-70">(example view)</span></div>
 </div>
 {/* Stats row */}
 <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ background: "var(--bg)" }}>
 {[
 { label: "Potential Funding", value: "$184,500" },
 { label: "Realistic Target", value: "$27,000" },
 { label: "Applied This Month", value: "$8,500" },
 { label: "Awards Won", value: "$2,000" },
 ].map((card) => (
 <div key={card.label} className="rounded-xl p-4 border" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
 <div className="text-xs mb-1" style={{ color: "var(--text-2)" }}>{card.label}</div>
 <div className="text-2xl font-bold text-gradient">{card.value}</div>
 </div>
 ))}
 </div>
 {/* Scholarship cards */}
 <div className="px-6 pb-6 grid md:grid-cols-3 gap-4" style={{ background: "var(--bg)" }}>
 {[
 { name: "Gates Scholarship", amount: "Full funding", deadline: "Sep · Annual", badge: "Curated" },
 { name: "Coca-Cola Scholars Program", amount: "$20,000", deadline: "Oct 31", badge: "Fastweb" },
 { name: "NSF Graduate Research Fellowship", amount: "$37,000/yr", deadline: "Oct · Annual", badge: "Scholarships.com" },
 ].map((sc) => (
 <div key={sc.name} className="rounded-xl p-4 border card-glow-hover" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
 <div className="flex items-center justify-between mb-2">
 <span className="badge-gold text-xs px-2 py-0.5 rounded-full font-medium">{sc.badge}</span>
 <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-2)" }}><Clock className="w-3 h-3" />{sc.deadline}</span>
 </div>
 <div className="text-sm font-semibold mb-1 truncate" style={{ color: "var(--text)" }}>{sc.name}</div>
 <div className="text-xl font-bold text-gradient">{sc.amount}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* Features */}
 <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
 <div className="text-center mb-20">
 <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>Everything in one place</h2>
 <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
 Stop juggling spreadsheets, essay docs, and scholarship sites. Audri is your scholarship operating system.
 </p>
 </div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
 {features.map((feature, i) => (
 <motion.div
 key={feature.title}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: i * 0.07 }}
 viewport={{ once: true }}
 className="rounded-2xl border p-6 card-glow-hover"
 style={{ background: "var(--surface)", borderColor: "var(--border)" }}
 >
 <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <feature.icon className="w-5 h-5" style={{ color: "var(--gold)" }} />
 </div>
 <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>{feature.title}</h3>
 <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{feature.description}</p>
 </motion.div>
 ))}
 </div>
 </section>

 {/* How it works */}
 <section id="how-it-works" className="py-28" style={{ background: "var(--surface)" }}>
 <div className="max-w-4xl mx-auto px-6">
 <div className="text-center mb-20">
 <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>Build once. Apply everywhere.</h2>
 <p className="text-lg" style={{ color: "var(--text-2)" }}>The entire scholarship process, automated from profile to draft.</p>
 </div>
 <div className="space-y-5">
 {[
 { step: "01", title: "Build your scholarship profile", description: "Upload your resume, speak about your experiences, or answer AI-guided questions. Audri extracts every achievement, story, and strength into a structured Knowledge Graph." },
 { step: "02", title: "Set your eligibility profile", description: "Tell Audri your state, GPA, major, education level, and demographics. From that moment on, you only see scholarships you can actually win." },
 { step: "03", title: "Get your match score and gap analysis", description: "See exactly how well you match, where your profile has gaps, and which stories from your Vault are most relevant to this scholarship." },
 { step: "04", title: "Generate a tailored essay", description: "Audri drafts an essay using your real stories and experience, matched to the specific prompt. Edit, revise, and finalize with AI scoring at every step." },
 ].map((item, i) => (
 <motion.div
 key={item.step}
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.4, delay: i * 0.1 }}
 viewport={{ once: true }}
 className="flex gap-6 rounded-2xl p-6 border"
 style={{ background: "var(--bg)", borderColor: "var(--border)" }}
 >
 <div className="text-3xl font-bold font-mono w-12 shrink-0" style={{ color: "var(--gold-dark)" }}>{item.step}</div>
 <div>
 <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>{item.title}</h3>
 <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{item.description}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* Testimonials */}
 <section id="highlights" className="relative z-10 max-w-5xl mx-auto px-6 py-28">
 <div className="text-center mb-20">
 <h2 className="text-4xl font-bold" style={{ color: "var(--text)" }}>What Audri actually does</h2>
 </div>
 <div className="grid md:grid-cols-3 gap-6">
 {highlights.map((t) => (
 <div key={t.name} className="rounded-2xl border p-6 card-glow-hover" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
 <div className="flex mb-4">
 <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
 </div>
 <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>{t.quote}</p>
 <div>
 <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{t.name}</div>
 <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{t.detail}</div>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Ethics */}
 <section className="py-20" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
 <div className="max-w-3xl mx-auto px-6 text-center">
 <div className="w-12 h-12 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
 <Shield className="w-6 h-6" style={{ color: "var(--gold)" }} />
 </div>
 <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>Your real story. Told powerfully.</h2>
 <p className="leading-relaxed" style={{ color: "var(--text-2)" }}>
 Audri never fabricates experiences, identities, hardships, or achievements. Our AI helps you
 surface, structure, and articulate your actual life, with the depth and specificity that scholarship
 committees respect. Every student has a story worth telling. We help you tell it better.
 </p>
 </div>
 </section>

 {/* CTA */}
 <section className="relative z-10 max-w-4xl mx-auto px-6 py-28 text-center">
 <div className="gold-line mb-20 max-w-xs mx-auto" />
 <h2 className="text-5xl font-bold mb-4" style={{ color: "var(--text)" }}>
 Ready to apply <span className="text-gradient">smarter?</span>
 </h2>
 <p className="text-lg mb-10" style={{ color: "var(--text-2)" }}>
 Build your scholarship profile in minutes. It&apos;s free to start.
 </p>
 <Link href="/signup" className="btn-gold inline-flex items-center gap-2 px-12 py-4 text-base" style={{ borderRadius: "var(--radius-lg)" }}>
 Start building your profile <ArrowRight className="w-5 h-5" />
 </Link>
 <p className="text-sm mt-4" style={{ color: "var(--text-3)" }}>No credit card. No commitment. Start in 2 minutes.</p>
 </section>

 {/* Footer */}
 <footer className="py-8" style={{ borderTop: "1px solid var(--border)" }}>
 <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
 <Sparkles className="w-3 h-3" style={{ color: "#080808" }} />
 </div>
 <span className="font-semibold text-sm" style={{ color: "var(--text-2)" }}>Audri</span>
 </div>
 <p className="text-xs" style={{ color: "var(--text-3)" }}>
 &copy; {new Date().getFullYear()} Audri. Built for students who expect to win.
 </p>
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="w-1 h-1 rounded-full" style={{ background: "var(--gold-dark)" }} />
 ))}
 </div>
 </div>
 </footer>
 </div>
 );
}
