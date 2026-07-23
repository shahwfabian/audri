"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Check, CreditCard, Crown, Loader2, Sparkles } from "lucide-react";

const PRO_FEATURES = [
 "Unlimited essay generation",
 "Funder research on every essay",
 "Unlimited rewrites",
 "Recommendation letter drafts",
 "Billing through Stripe Checkout",
];

export default function UpgradePage() {
 const { user, setUser } = useAppStore();
 const [billingLoading, setBillingLoading] = useState(false);
 const isPro = user?.plan === "pro";

 useEffect(() => {
  if (!user) return;
  fetch("/api/billing/activate", { headers: user.token ? { Authorization: "Bearer " + user.token } : {} })
   .then((response) => response.ok ? response.json() : null)
   .then((data) => {
    if (data?.user && data.user.plan !== user.plan) {
     setUser({ ...user, plan: data.user.plan, essaysRemaining: data.user.essaysRemaining });
    }
   })
   .catch(() => {});
 }, [setUser, user]);

 async function openBilling(endpoint: "checkout" | "portal") {
 if (!user) {
   toast.error("Sign in first.");
   return;
  }
  setBillingLoading(true);
  try {
   const response = await fetch("/api/billing/" + endpoint, {
    method: "POST",
    headers: user.token ? { Authorization: "Bearer " + user.token } : {},
   });
   const data = await response.json();
   if (!response.ok || !data.url) {
    toast.error(data.error ?? "Billing is unavailable.");
    return;
   }
   window.location.assign(data.url);
  } catch {
   toast.error("Could not reach the server.");
  } finally {
   setBillingLoading(false);
  }
 }

 return (
  <div className="max-w-2xl mx-auto space-y-6 pb-10">
   <div className="text-center pt-4">
    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold)" }}>
     <Crown className="w-3.5 h-3.5" /> Audri Pro
    </div>
    <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
     {isPro ? <>Your Pro plan is active.</> : <>Keep writing after your 2 free essays.</>}
    </h1>
    {!isPro && (
     <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
      Start with 2 essays free. Upgrade when Audri has proved it belongs in your scholarship routine.
     </p>
    )}
   </div>

   {!isPro && (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--gold-25)", boxShadow: "0 0 60px var(--gold-10)" }}>
     <div className="p-8 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-baseline justify-center gap-1">
       <span className="text-5xl font-bold text-gradient">$9</span>
       <span className="text-sm" style={{ color: "var(--text-2)" }}>/month</span>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>Checkout and billing are handled by Stripe.</p>
     </div>
     <div className="p-8 space-y-3">
      {PRO_FEATURES.map((feature) => (
       <div key={feature} className="flex items-start gap-3">
        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
        <span className="text-sm" style={{ color: "var(--text-2)" }}>{feature}</span>
       </div>
      ))}
      <button type="button" onClick={() => openBilling("checkout")} disabled={billingLoading} className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold mt-4">
       {billingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
       Upgrade to Pro
      </button>
     </div>
    </div>
   )}

   {isPro && (
    <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
     <p className="text-sm" style={{ color: "var(--gold-light)" }}>
      Unlimited essay generation is active for <span className="font-semibold">{user?.email}</span>.
     </p>
     <button type="button" onClick={() => openBilling("portal")} disabled={billingLoading} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
      {billingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      Manage billing
     </button>
    </div>
   )}
  </div>
 );
}
