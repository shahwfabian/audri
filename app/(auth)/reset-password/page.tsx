"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
 const router = useRouter();
 const [code, setCode] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 async function submit(event: FormEvent) {
  event.preventDefault();
  setLoading(true);
  try {
   const email = new URLSearchParams(window.location.search).get("email") ?? "";
   const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password }),
   });
   const data = await response.json();
   if (!response.ok) {
    toast.error(data.error ?? "Could not reset the password.");
    return;
   }
   toast.success("Password updated. Sign in again.");
   router.replace("/login");
  } catch {
   toast.error("Could not reach the server.");
  } finally {
   setLoading(false);
  }
 }

 return (
  <main className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
   <form onSubmit={submit} className="w-full max-w-md rounded-2xl border p-8 space-y-5" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
    <div>
     <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Choose a new password</h1>
     <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>Enter the code from your email, then choose a password with at least 10 characters.</p>
    </div>
    <input
     type="text"
     inputMode="numeric"
     autoComplete="one-time-code"
     pattern="[0-9]{6}"
     maxLength={6}
     value={code}
     onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
     className="input-dark w-full py-3 text-center tracking-[0.35em]"
     placeholder="000000"
     aria-label="Verification code"
     required
    />
    <input type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} className="input-dark w-full py-3" aria-label="New password" required />
    <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm">{loading ? "Updating..." : "Update password"}</button>
   </form>
  </main>
 );
}
