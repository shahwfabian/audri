"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AudriLogo } from "@/components/AudriLogo";
import { useAppStore } from "@/lib/store";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
 const router = useRouter();
 const { signIn } = useAppStore();
 const [code, setCode] = useState("");
 const [loading, setLoading] = useState(false);
 const [resending, setResending] = useState(false);

 async function verify(event: React.FormEvent) {
  event.preventDefault();
  if (!/^\d{6}$/.test(code)) {
   toast.error("Enter the six digit code from your email.");
   return;
  }
  setLoading(true);
  try {
   const response = await fetch("/api/auth/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: initialEmail, code }),
   });
   const data = await response.json();
   if (!response.ok || !data.user) {
    toast.error(data.error ?? "Could not verify your email.");
    return;
   }
   signIn({ ...data.user, role: "STUDENT" }, null);
   toast.success("Your email is verified. Welcome to Audri.");
   router.push("/onboarding");
  } catch {
   toast.error("Could not reach the server. Try again.");
  } finally {
   setLoading(false);
  }
 }

 async function resend() {
  setResending(true);
  try {
   const response = await fetch("/api/auth/resend-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: initialEmail }),
   });
   const data = await response.json();
   if (!response.ok) {
    toast.error(data.error ?? "Could not send a new code.");
    return;
   }
   toast.success("A new code is on its way.");
  } catch {
   toast.error("Could not reach the server. Try again.");
  } finally {
   setResending(false);
  }
 }

 if (!initialEmail) {
  return (
   <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
    <div className="w-full max-w-md rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
     <h1 className="text-2xl font-bold mb-3">Start your signup again</h1>
     <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>We need your email before we can verify your account.</p>
     <Link href="/signup" className="btn-gold inline-flex px-6 py-3">Return to signup</Link>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
   <div className="w-full max-w-md rounded-2xl border p-8" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
    <div className="flex items-center gap-3 mb-8">
     <AudriLogo size={36} />
     <span className="text-xl font-bold">Audri</span>
    </div>
    <MailCheck className="w-8 h-8 mb-5" aria-hidden="true" />
    <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
    <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>
     We sent a six digit code to <span className="font-semibold" style={{ color: "var(--text)" }}>{initialEmail}</span>. The code expires soon.
    </p>

    <form onSubmit={verify} className="space-y-5">
     <div>
      <label htmlFor="verification-code" className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
       Verification code
      </label>
      <input
       id="verification-code"
       type="text"
       inputMode="numeric"
       autoComplete="one-time-code"
       pattern="[0-9]{6}"
       maxLength={6}
       value={code}
       onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
       placeholder="000000"
       className="input-dark w-full px-4 py-4 text-center text-2xl tracking-[0.45em]"
       required
       autoFocus
      />
     </div>
     <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-sm">
      {loading ? "Verifying..." : "Verify and continue"}
     </button>
    </form>

    <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
     <button type="button" onClick={resend} disabled={resending} className="text-sm font-semibold hover:underline">
      {resending ? "Sending..." : "Send a new code"}
     </button>
     <p className="text-xs mt-4" style={{ color: "var(--text-3)" }}>
      Wrong email? <Link href="/signup" className="underline">Start again</Link>
     </p>
    </div>
   </div>
  </div>
 );
}
