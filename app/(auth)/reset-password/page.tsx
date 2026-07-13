"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
 const router = useRouter();
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);

 async function submit(event: FormEvent) {
  event.preventDefault();
  setLoading(true);
  try {
   const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: new URLSearchParams(window.location.search).get("token"), password }),
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
     <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>Use at least 10 characters.</p>
    </div>
    <input type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} className="input-dark w-full py-3" required />
    <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm">{loading ? "Updating..." : "Update password"}</button>
   </form>
  </main>
 );
}
