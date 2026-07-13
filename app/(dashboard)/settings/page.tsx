"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import {
 Key,
 CheckCircle2,
 Eye,
 EyeOff,
 AlertTriangle,
 ExternalLink,
 Sparkles,
 Shield,
 Save,
 Download,
 Trash2,
} from "lucide-react";

export default function SettingsPage() {
 const router = useRouter();
 const { apiKey, user, setApiKey, logout } = useAppStore();

 const [anthropicKey, setAnthropicKey] = useState(apiKey ?? "");
 const [showAnthropicKey, setShowAnthropicKey] = useState(false);
 const [testing, setTesting] = useState(false);
 const [testResult, setTestResult] = useState<"ok" | "billing" | "invalid" | "fail" | null>(null);
 const [testDetail, setTestDetail] = useState<string | null>(null);
 const [serverHasKey, setServerHasKey] = useState<boolean | null>(null);
 const [deletePassword, setDeletePassword] = useState("");
 const [deleteConfirmation, setDeleteConfirmation] = useState("");
 const [accountBusy, setAccountBusy] = useState(false);

 // Detect whether AI is already active server-side (hosted key) so we never
 // tell a student "AI is off" when it actually works out of the box.
 useEffect(() => {
 fetch("/api/ai/has-key")
 .then((r) => r.json())
 .then((d) => setServerHasKey(!!d.hasKey))
 .catch(() => setServerHasKey(false));
 }, []);

 async function handleTestAndSave() {
 if (!anthropicKey.trim()) { toast.error("Enter your Anthropic API key first."); return; }
 setTesting(true);
 setTestResult(null);
 setTestDetail(null);
 try {
 const res = await fetch("/api/ai/test-key", {
 method: "POST",
 headers: { "Content-Type": "application/json", "x-audri-api-key": anthropicKey.trim(), ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}) },
 body: JSON.stringify({}),
 });
 const body = await res.json().catch(() => ({}));
 if (res.ok) {
 setTestResult("ok");
 setApiKey(anthropicKey.trim());
 toast.success("API key verified and saved!");
 } else if (res.status === 402 && body.keyValid) {
 setTestResult("billing");
 setTestDetail(body.detail ?? null);
 setApiKey(anthropicKey.trim());
 toast.warning("Key saved. Add billing credits at Anthropic to activate AI features.");
 } else if (res.status === 401) {
 setTestResult("invalid");
 toast.error("That key isn't valid. Copy it again from console.anthropic.com.");
 } else {
 setTestResult("fail");
 setTestDetail(body.detail ?? null);
 setApiKey(anthropicKey.trim());
 toast.info("Saved anyway. Test was inconclusive, AI may still work.");
 }
 } catch {
 setTestResult("fail");
 toast.error("Could not reach the server. Check your connection.");
 } finally {
 setTesting(false);
 }
 }

 function handleSaveWithoutTest() {
 if (!anthropicKey.trim()) { toast.error("Enter your API key first."); return; }
 setApiKey(anthropicKey.trim());
 toast.success("Settings saved.");
 }

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

 const hasPersonalKey = !!apiKey;
 const aiActive = hasPersonalKey || serverHasKey === true;

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
 <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Configure Audri for your account.</p>
 </div>

 {/* Status banner */}
 {aiActive ? (
 <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(32,200,120,0.08)", border: "1px solid rgba(32,200,120,0.25)" }}>
 <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--green)" }} />
 <p className="text-sm font-medium" style={{ color: "var(--green)" }}>
 AI features are active{!hasPersonalKey && serverHasKey ? ", powered by Audri. You don't need your own key." : "."}
 </p>
 </div>
 ) : serverHasKey === null ? null : (
 <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
 <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
 <div>
 <p className="font-semibold text-sm" style={{ color: "#F59E0B" }}>AI features are not active</p>
 <p className="text-xs mt-0.5" style={{ color: "rgba(245,158,11,0.7)" }}>
 Add your Anthropic API key below to enable scholarship parsing, essay generation, gap analysis, and all AI features.
 </p>
 </div>
 </div>
 )}

 {/* Anthropic API Key */}
 <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem", padding: "1.5rem" }}>
 <div className="flex items-center gap-3 mb-4">
 <div style={{ width: 36, height: 36, borderRadius: "0.75rem", background: "rgba(255, 255, 255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
 <Key className="w-4 h-4" style={{ color: "var(--gold)" }} />
 </div>
 <div>
 <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
 Anthropic API Key{" "}
 {serverHasKey && !hasPersonalKey && (
 <span className="text-xs font-normal" style={{ color: "var(--text-3)" }}>(optional, bring your own)</span>
 )}
 </h2>
 <p className="text-xs" style={{ color: "var(--text-3)" }}>
 {serverHasKey && !hasPersonalKey
 ? "AI already works on your account. Add a personal key only if you'd rather use your own."
 : "Powers all AI features in Audri"}
 </p>
 </div>
 </div>

 <div className="relative mb-3">
 <input
 type={showAnthropicKey ? "text" : "password"}
 value={anthropicKey}
 onChange={(e) => setAnthropicKey(e.target.value)}
 placeholder="sk-ant-api03-..."
 className="input-dark w-full text-sm font-mono pr-10"
 />
 <button
 onClick={() => setShowAnthropicKey(!showAnthropicKey)}
 className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
 style={{ color: "var(--text-3)" }}
 onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
 onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
 >
 {showAnthropicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>

 <div className="flex items-center gap-2 mb-4">
 <button
 onClick={handleTestAndSave}
 disabled={testing || !anthropicKey.trim()}
 className="btn-gold flex items-center gap-2 text-sm"
 >
 {testing
 ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(0,0,0,0.2)", borderTopColor: "#080808" }} />
 : <Sparkles className="w-4 h-4" />}
 {testing ? "Testing..." : "Test & Save"}
 </button>
 <button
 onClick={handleSaveWithoutTest}
 disabled={!anthropicKey.trim()}
 className="btn-ghost flex items-center gap-2 text-sm"
 >
 <Save className="w-4 h-4" />
 Save without testing
 </button>
 </div>

 {testResult === "ok" && (
 <div className="flex items-center gap-2 text-xs rounded-xl p-3" style={{ background: "rgba(32,200,120,0.08)", border: "1px solid rgba(32,200,120,0.2)" }}>
 <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--green)" }} />
 <span className="font-medium" style={{ color: "var(--green)" }}>Key is valid and working. AI features are active.</span>
 </div>
 )}

 {testResult === "billing" && (
 <div className="rounded-xl p-3 space-y-2" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
 <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#F59E0B" }}>
 <AlertTriangle className="w-4 h-4 shrink-0" />
 Your API key is valid, but your Anthropic account has no credits.
 </div>
 <p className="text-xs leading-relaxed" style={{ color: "rgba(245,158,11,0.8)" }}>
 {testDetail ?? "Your key was saved. Once you add credits, all AI features will work automatically."}
 </p>
 <a
 href="https://console.anthropic.com/settings/billing"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
 style={{ background: "#F59E0B", color: "#080808" }}
 >
 Add credits at console.anthropic.com
 <ExternalLink className="w-3 h-3" />
 </a>
 </div>
 )}

 {testResult === "invalid" && (
 <div className="flex items-start gap-2 rounded-xl p-3 text-xs" style={{ background: "rgba(229,80,80,0.08)", border: "1px solid rgba(229,80,80,0.2)" }}>
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
 <div>
 <p className="font-semibold" style={{ color: "var(--red)" }}>Key not recognized by Anthropic.</p>
 <p className="mt-0.5" style={{ color: "rgba(229,80,80,0.7)" }}>Make sure you copied the full key, it starts with <code className="rounded px-1" style={{ background: "rgba(229,80,80,0.15)" }}>sk-ant-</code></p>
 <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline mt-1 inline-block" style={{ color: "var(--red)" }}>
 Get your key from console.anthropic.com
 </a>
 </div>
 </div>
 )}

 {testResult === "fail" && (
 <div className="flex items-start gap-2 rounded-xl p-3 text-xs" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-3)" }} />
 <div>
 <p className="font-medium" style={{ color: "var(--text-2)" }}>Test was inconclusive, key saved anyway.</p>
 <p className="mt-0.5" style={{ color: "var(--text-3)" }}>Try using an AI feature to confirm it works, or check your connection.</p>
 </div>
 </div>
 )}

 <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
 <a
 href="https://console.anthropic.com/settings/keys"
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs flex items-center gap-1 transition-colors"
 style={{ color: "var(--gold-dark)" }}
 onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
 onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold-dark)")}
 >
 Get your API key from console.anthropic.com
 <ExternalLink className="w-3 h-3" />
 </a>
 <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
 Your key remains in this browser session and is cleared after a reload.
 </p>
 </div>
 </div>

 {/* Privacy notice */}
 <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
 <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-3)" }} />
 <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
 Personal API keys remain only for the current browser session. Audri sends a key through its protected server route to the AI provider for each request. The application does not save the key on its server.
 </p>
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
