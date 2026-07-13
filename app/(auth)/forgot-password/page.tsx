"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
 const [email, setEmail] = useState("");
 const [sent, setSent] = useState(false);
 const [loading, setLoading] = useState(false);

 async function submit(event: FormEvent) {
  event.preventDefault();
  setLoading(true);
  try {
   const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
   });
   if (!response.ok) {
    const data = await response.json();
    toast.error(data.error ?? "Password reset is unavailable.");
    return;
   }
   setSent(true);
  } catch {
   toast.error("Could not reach the server.");
  } finally {
   setLoading(false);
  }
 }

 return (
  <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
   <div className="w-full max-w-md rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
    <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Reset your password</h1>
    <p className="text-sm mt-2 mb-6" style={{ color: "var(--text-2)" }}>
     Enter your account email. If it matches an account, Audri will send a reset link.
    </p>
    {sent ? (
     <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-2)" }}>Check your inbox for the reset link.</p>
      <Link href="/login" className="btn-gold inline-flex px-5 py-3 text-sm">Return to sign in</Link>
     </div>
    ) : (
     <form onSubmit={submit} className="space-y-4">
      <div className="relative">
       <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-3)" }} />
       <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-dark w-full pl-10 py-3" placeholder="you@example.com" required />
      </div>
      <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm">{loading ? "Sending..." : "Send reset link"}</button>
     </form>
    )}
   </div>
  </main>
 );
}

