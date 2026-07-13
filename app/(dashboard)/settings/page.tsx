"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Download, Shield, Sparkles, Trash2 } from "lucide-react";

export default function SettingsPage() {
 const router = useRouter();
 const { user, logout } = useAppStore();
 const [deletePassword, setDeletePassword] = useState("");
 const [deleteConfirmation, setDeleteConfirmation] = useState("");
 const [accountBusy, setAccountBusy] = useState(false);

 async function downloadAccountData() {
  if (!user) return;
  setAccountBusy(true);
  try {
   const response = await fetch("/api/auth/account", { headers: user.token ? { Authorization: "Bearer " + user.token } : {} });
   const data = await response.json();
   if (!response.ok) {
    toast.error(data.error ?? "Could not export your data.");
    return;
   }
   const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
   const link = document.createElement("a");
   link.href = url;
   link.download = "audri-account-data.json";
   link.click();
   URL.revokeObjectURL(url);
  } finally {
   setAccountBusy(false);
  }
 }

 async function deleteAccount() {
  if (!user) return;
  if (deleteConfirmation !== "DELETE") {
   toast.error("Type DELETE to confirm.");
   return;
  }
  setAccountBusy(true);
  try {
   const response = await fetch("/api/auth/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...(user.token ? { Authorization: "Bearer " + user.token } : {}) },
    body: JSON.stringify({ password: deletePassword, confirmation: deleteConfirmation }),
   });
   const data = await response.json();
   if (!response.ok) {
    toast.error(data.error ?? "Could not delete your account.");
    return;
   }
   logout();
   router.replace("/");
  } finally {
   setAccountBusy(false);
  }
 }

 return (
  <div className="max-w-2xl mx-auto space-y-6">
   <div>
    <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
    <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Manage your Audri account.</p>
   </div>

   <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--gold-25)" }}>
    <div className="flex items-start gap-3">
     <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gold-10)" }}>
      <Sparkles className="w-4 h-4" style={{ color: "var(--gold)" }} />
     </div>
     <div>
      <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>AI is included with Audri</h2>
      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-2)" }}>
       There is nothing to configure. Essay generation, scholarship analysis, profile tools, and recommendations work through your Audri account.
      </p>
     </div>
    </div>
    <div className="mt-4 pt-4 flex items-start gap-2" style={{ borderTop: "1px solid var(--border)" }}>
     <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-3)" }} />
     <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
      You never need a provider account or API key. Audri manages its AI service securely on the server.
     </p>
    </div>
   </div>

   <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
    <div>
     <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Account data</h2>
     <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Download your stored information or permanently remove your account.</p>
    </div>
    <button type="button" onClick={downloadAccountData} disabled={accountBusy} className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
     <Download className="w-4 h-4" /> Download my data
    </button>
    <div className="pt-5 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
     <div className="flex items-center gap-2">
      <Trash2 className="w-4 h-4" style={{ color: "var(--red)" }} />
      <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Delete account</h3>
     </div>
     <p className="text-xs" style={{ color: "var(--text-3)" }}>This cancels an active subscription and permanently deletes stored account data.</p>
     <input type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} placeholder="Current password" className="input-dark w-full text-sm" />
     <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="Type DELETE" className="input-dark w-full text-sm" />
     <button type="button" onClick={deleteAccount} disabled={accountBusy} className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm" style={{ color: "var(--red)" }}>
      Delete my account
     </button>
    </div>
   </div>
  </div>
 );
}
