"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
 Sparkles,
 User,
 Globe,
 MousePointerClick,
 ClipboardPaste,
 FileCheck2,
 Target,
 ArrowRight,
 Mail,
 BookOpen,
 ShieldCheck,
} from "lucide-react";

const STEPS = [
 {
 n: 1,
 icon: User,
 title: "Build your profile, once",
 text: "Tell Audri who you really are: your school, your goals, your real experiences. Five minutes, one time. Every essay after this is built from YOUR life, so the more real detail you give, the better every essay gets.",
 href: "/profile",
 linkLabel: "Open My Profile",
 },
 {
 n: 2,
 icon: Globe,
 title: "Find any scholarship, anywhere",
 text: "Google, your counselor's email, Fastweb, Bold.org, a flyer from your church, it does not matter where. If you can see the scholarship's page, Audri can work with it. Check Find Scholarships for ones near you.",
 href: "/scholarships/search",
 linkLabel: "Find Scholarships",
 },
 {
 n: 3,
 icon: MousePointerClick,
 title: "Copy the ENTIRE page",
 text: "On the scholarship's website press Ctrl+A (select all), then Ctrl+C (copy). Don't clean it up. Don't pick parts. Grab everything, the name, the deadline, the essay prompt, even the menu junk. Audri sorts it out.",
 href: "/generate",
 linkLabel: "I copied it, take me there",
 },
 {
 n: 4,
 icon: ClipboardPaste,
 title: "Paste it into the Essay Generator",
 text: "Press Ctrl+V in the big box, hit \"Write My Essay,\" and watch. Audri finds the prompt, studies what the judges want, digs through your profile for the story only you can tell, and writes your essay.",
 href: "/generate",
 linkLabel: "Open the Essay Generator",
 flagship: true,
 },
 {
 n: 5,
 icon: FileCheck2,
 title: "Read it. Make it yours. Submit.",
 text: "Read the essay out loud once. Tweak anything that doesn't sound like you (or hit Rewrite). Copy it, paste it into the application, and submit. That's the whole job.",
 href: "/generate",
 linkLabel: "Write my first essay",
 },
 {
 n: 6,
 icon: Target,
 title: "Log it. Keep the streak alive.",
 text: "On your Dashboard, set how many scholarships you'll finish today and check them off. The more you apply to, the better your odds, volume wins, and streaks build volume.",
 href: "/dashboard",
 linkLabel: "Set today's goal",
 },
];

export default function ManualPage() {
 // remember that this student has seen the manual
 useEffect(() => {
 try {
 localStorage.setItem("audri:manual-seen", "1");
 } catch {}
 }, []);

 return (
 <div className="max-w-3xl mx-auto space-y-8 pb-10">
 {/* Header */}
 <div className="text-center pt-2">
 <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold)" }}>
 <BookOpen className="w-3.5 h-3.5" /> The Audri Manual
 </div>
 <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
 Six steps. <span className="text-gradient">That&apos;s the whole system.</span>
 </h1>
 <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
 Audri does one thing better than anything else on Earth: you paste a scholarship,
 it writes your essay from your real story. Here is exactly how to use it.
 </p>
 </div>

 {/* Steps */}
 <div className="space-y-3">
 {STEPS.map((step) => (
 <Link
 key={step.n}
 href={step.href}
 className="block rounded-2xl p-5 transition-all group"
 style={{
 background: step.flagship ? "var(--gold-10)" : "var(--surface)",
 border: step.flagship ? "1px solid var(--gold-25)" : "1px solid var(--border-2)",
 }}
 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; }}
 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = step.flagship ? "var(--gold-25)" : "var(--border-2)"; }}
 >
 <div className="flex items-start gap-4">
 {/* Number */}
 <div
 className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
 style={{
 background: step.flagship ? "var(--gold)" : "var(--surface-2)",
 color: step.flagship ? "#080808" : "var(--gold)",
 border: step.flagship ? "none" : "1px solid var(--border-2)",
 }}
 >
 {step.n}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <step.icon className="w-4 h-4" style={{ color: "var(--gold)" }} />
 <h2 className="font-bold text-[15px]" style={{ color: "var(--text)" }}>{step.title}</h2>
 </div>
 <p className="text-sm" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{step.text}</p>
 <span className="inline-flex items-center gap-1.5 text-xs font-semibold mt-3" style={{ color: "var(--gold)" }}>
 {step.linkLabel} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>

 {/* Extras */}
 <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>
 When you&apos;re ready for more
 </h2>
 <div className="grid sm:grid-cols-3 gap-3">
 {[
 { icon: Mail, title: "Rec Letters", text: "Draft your recommendation letter and hand it to your teacher, they edit and sign.", href: "/recommendations" },
 { icon: BookOpen, title: "Story Vault", text: "Turn your experiences into reusable stories so every essay gets stronger.", href: "/stories" },
 { icon: ShieldCheck, title: "Eligibility Profile", text: "Add your state and background so you only see scholarships you actually qualify for.", href: "/profile" },
 ].map((x) => (
 <Link key={x.title} href={x.href} className="rounded-xl p-4 transition-colors" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
 onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--gold-25)")}
 onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
 >
 <x.icon className="w-4 h-4 mb-2" style={{ color: "var(--gold)" }} />
 <div className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{x.title}</div>
 <div className="text-xs" style={{ color: "var(--text-3)", lineHeight: 1.6 }}>{x.text}</div>
 </Link>
 ))}
 </div>
 </div>

 {/* Big flagship CTA */}
 <div className="text-center pt-2">
 <Link href="/generate" className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-base font-bold glow-pulse">
 <Sparkles className="w-5 h-5" /> Paste Your First Scholarship
 </Link>
 <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
 Your first essay takes about 60 seconds. Go get your money.
 </p>
 </div>
 </div>
 );
}
