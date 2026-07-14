"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, User, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const benefits = [
 "Build your scholarship profile once, apply everywhere",
 "Paste any scholarship, get instant eligibility analysis",
 "Generate tailored essays from your real stories",
 "Track every deadline from one command center",
];

export default function SignupPage() {
 const router = useRouter();
 const { signIn } = useAppStore();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [acceptedTerms, setAcceptedTerms] = useState(false);
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!name || !email || !password) { toast.error("Please fill in all fields."); return; }
 setLoading(true);
 try {
 const res = await fetch("/api/auth/signup", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name, email, password, acceptedTerms }),
 });
 const data = await res.json();
 if (!res.ok) {
 toast.error(data.error ?? "Could not create your account.");
 return;
 }
 if (data.verificationRequired && data.email) {
  toast.success("Check your email for your verification code.");
  router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  return;
 }
 if (!data.user) {
  toast.error("Could not create your account.");
  return;
 }
 signIn({ ...data.user, role: "STUDENT" }, null);
 toast.success(`Welcome to Audri, ${data.user.name}!`);
 router.push("/onboarding");
 } catch {
 toast.error("Could not reach the server. Try again.");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
 {/* Ambient glow */}
 <div className="fixed inset-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
 <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
 </div>

 <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center relative z-10">
 {/* Left, brand */}
 <div className="hidden md:block">
 <div className="flex items-center gap-3 mb-10">
 <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center" style={{ boxShadow: "0 0 24px var(--gold-25)" }}>
 <Sparkles className="w-5 h-5" style={{ color: "#080808" }} />
 </div>
 <span className="font-bold text-2xl" style={{ color: "var(--text)" }}>Audri</span>
 </div>

 <h2 className="text-4xl font-bold mb-4 leading-tight">
 <span style={{ color: "var(--text)" }}>Your scholarship</span>
 <br />
 <span className="text-gradient">operating system.</span>
 </h2>
 <p className="text-base leading-relaxed mb-10" style={{ color: "var(--text-2)" }}>
 Stop rewriting essays, missing deadlines, and searching through scholarships that don&apos;t fit you.
 </p>

 <div className="space-y-4">
 {benefits.map((b) => (
 <div key={b} className="flex items-start gap-3">
 <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
 <span className="text-sm" style={{ color: "var(--text-2)" }}>{b}</span>
 </div>
 ))}
 </div>

 <div className="mt-10 p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
 <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: "var(--gold)" }}>ETHICAL COMMITMENT</div>
 <p className="text-sm" style={{ color: "var(--text-2)" }}>
 Audri is designed to draft only from details you provide. Review every essay before you submit it.
 </p>
 </div>
 </div>

 {/* Right, form */}
 <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
 <div className="md:hidden flex items-center gap-2 mb-8">
 <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
 <Sparkles className="w-4 h-4" style={{ color: "#080808" }} />
 </div>
 <span className="font-bold text-xl" style={{ color: "var(--text)" }}>Audri</span>
 </div>

 <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Create your account</h1>
 <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>Free to start. A guided setup helps you build your scholarship profile.</p>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Full Name</label>
 <div className="relative">
 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Alex Johnson"
 className="input-dark w-full pl-10 pr-4 py-3 text-sm"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Email Address</label>
 <div className="relative">
 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@gmail.com, Gmail, Yahoo, school email, anything works"
 className="input-dark w-full pl-10 pr-4 py-3 text-sm"
 required
 />
 </div>
 <p className="text-[11px] mt-1.5" style={{ color: "var(--text-3)" }}>
 Use an email you control. It protects account access and password recovery.
 </p>
 </div>

 <div>
 <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Password</label>
 <div className="relative">
 <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="At least 10 characters"
 minLength={10}
 className="input-dark w-full pl-10 pr-4 py-3 text-sm"
 required
 />
 </div>
 </div>

 <label className="flex items-start gap-3 text-xs" style={{ color: "var(--text-2)" }}>
  <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required className="mt-0.5" />
  <span>I agree to the <Link href="/terms" className="underline">Terms</Link> and acknowledge the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
 </label>

 <button
 type="submit"
 disabled={loading}
 className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-2"
 >
 {loading ? (
 <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(0,0,0,0.3)", borderTopColor: "#080808" }} />
 ) : (
 <><span>Start building your profile</span><ArrowRight className="w-4 h-4" /></>
 )}
 </button>
 </form>

 <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
 <p className="text-sm" style={{ color: "var(--text-2)" }}>
 Already have an account?{" "}
 <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>
 Sign in
 </Link>
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
