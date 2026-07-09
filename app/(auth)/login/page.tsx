"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AudriLogo } from "@/components/AudriLogo";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        toast.error(data.error ?? "Sign-in failed.");
        return;
      }
      signIn({ ...data.user, role: "STUDENT" }, data.profile ?? null);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/generate");
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
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--gold-25)", boxShadow: "0 0 24px var(--gold-25)" }}>
              <AudriLogo size={30} />
            </div>
            <span className="font-bold text-2xl" style={{ color: "var(--text)" }}>Audri</span>
          </Link>
          <p className="text-sm mt-3" style={{ color: "var(--text-2)" }}>Sign in to your scholarship command center</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>Enter your details to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="input-dark w-full pl-10 pr-4 py-3 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="input-dark w-full pl-10 pr-4 py-3 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(0,0,0,0.3)", borderTopColor: "#080808" }} />
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>
                Create one free
              </Link>
            </p>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-3)" }}>
            Demo mode — any name and email will work.
          </p>
        </div>
      </div>
    </div>
  );
}
