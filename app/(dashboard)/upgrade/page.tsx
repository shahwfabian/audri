"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BILLING_PLANS, type BillingPlanId } from "@/lib/billing/plans";
import { toast } from "sonner";
import { Check, CreditCard, Crown, Loader2, Sparkles } from "lucide-react";

export default function UpgradePage() {
 const { user, setUser } = useAppStore();
 const [billingLoading, setBillingLoading] = useState<BillingPlanId | "portal" | null>(null);
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

 async function openBilling(endpoint: "checkout" | "portal", plan?: BillingPlanId) {
 if (!user) {
   toast.error("Sign in first.");
   return;
  }
  setBillingLoading(endpoint === "portal" ? "portal" : plan ?? "student");
  try {
   const response = await fetch("/api/billing/" + endpoint, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     ...(user.token ? { Authorization: "Bearer " + user.token } : {}),
    },
    body: endpoint === "checkout" ? JSON.stringify({ plan: plan ?? "student" }) : undefined,
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
   setBillingLoading(null);
  }
 }

 return (
  <div className="max-w-5xl mx-auto space-y-6 pb-10">
   <div className="text-center pt-4">
    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold)" }}>
     <Crown className="w-3.5 h-3.5" /> Audri Pro
    </div>
    <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
     {isPro ? <>Your Pro access is active.</> : <>Choose your scholarship season.</>}
    </h1>
    {!isPro && (
     <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
      Start with 2 essays free every 7 days. Upgrade when Audri has proved it belongs in your scholarship routine.
     </p>
    )}
   </div>

   {!isPro && (
    <div className="grid gap-4 md:grid-cols-3">
     {BILLING_PLANS.map((plan) => (
      <div key={plan.id} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--surface)", border: "1px solid var(--gold-25)", boxShadow: plan.id === "student" ? "0 0 60px var(--gold-10)" : undefined }}>
       <div className="p-6 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
        {plan.badge && (
         <div className="inline-flex text-[10px] font-semibold uppercase tracking-widest rounded-full px-2.5 py-1 mb-3" style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
          {plan.badge}
         </div>
        )}
        <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{plan.name}</h2>
        <div className="flex items-baseline justify-center gap-1 mt-3">
         <span className="text-4xl font-bold text-gradient">{plan.price}</span>
         <span className="text-sm" style={{ color: "var(--text-2)" }}>/{plan.cadence}</span>
        </div>
       </div>
       <div className="p-6 space-y-3 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
         {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
           <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
           <span className="text-sm" style={{ color: "var(--text-2)" }}>{feature}</span>
          </div>
         ))}
        </div>
        <button type="button" onClick={() => openBilling("checkout", plan.id)} disabled={Boolean(billingLoading)} className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold mt-4">
         {billingLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
         Choose {plan.name}
        </button>
       </div>
      </div>
     ))}
     <p className="md:col-span-3 text-center text-xs" style={{ color: "var(--text-3)" }}>Checkout and billing are handled by Stripe.</p>
    </div>
   )}

   {isPro && (
    <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
     <p className="text-sm" style={{ color: "var(--gold-light)" }}>
      Unlimited essay generation is active for <span className="font-semibold">{user?.email}</span>.
     </p>
     <button type="button" onClick={() => openBilling("portal")} disabled={Boolean(billingLoading)} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
      {billingLoading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
      Manage billing
     </button>
    </div>
   )}
  </div>
 );
}
