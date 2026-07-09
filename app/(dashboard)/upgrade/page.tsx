"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Sparkles, Check, Loader2, Crown, KeyRound } from "lucide-react";

const PRO_FEATURES = [
  "Unlimited essay generation — every scholarship, every prompt",
  "Funder research & mission alignment on every essay",
  "Unlimited rewrites and revisions",
  "Recommendation letter drafts",
  "Priority access to new features",
];

export default function UpgradePage() {
  const { user, setUser } = useAppStore();
  const [code, setCode] = useState("");
  const [activating, setActivating] = useState(false);

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  const isPro = user?.plan === "pro";

  async function handleActivate() {
    if (!user?.email) {
      toast.error("Sign in first.");
      return;
    }
    if (!code.trim()) {
      toast.error("Enter your activation code.");
      return;
    }
    setActivating(true);
    try {
      const res = await fetch("/api/billing/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ email: user.email, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        toast.error(data.error ?? "Activation failed.");
        return;
      }
      setUser({ ...user, plan: data.user.plan, essaysRemaining: data.user.essaysRemaining });
      toast.success("Welcome to Audri Pro — unlimited essays unlocked.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)", color: "var(--gold)" }}>
          <Crown className="w-3.5 h-3.5" /> Audri Pro
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
          {isPro ? <>You&apos;re <span className="text-gradient">Pro</span>. Go win.</> : <>Unlimited essays. <span className="text-gradient">Unlimited chances.</span></>}
        </h1>
        {!isPro && (
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-2)", lineHeight: 1.7 }}>
            The more scholarships you apply to, the better your odds. Go unlimited so an essay cap
            never decides how many you go after.
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
            <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>Cancel anytime. Less than one application fee.</p>
          </div>

          <div className="p-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
                <span className="text-sm" style={{ color: "var(--text-2)" }}>{f}</span>
              </div>
            ))}

            {paymentLink ? (
              <a
                href={`${paymentLink}${paymentLink.includes("?") ? "&" : "?"}prefilled_email=${encodeURIComponent(user?.email ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold mt-4"
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </a>
            ) : (
              <div className="rounded-xl p-4 mt-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  Checkout opens here once the Stripe payment link is configured
                  (<code style={{ color: "var(--gold)" }}>NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code> in .env.local).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activation code — how Pro turns on after payment */}
      {!isPro && (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4" style={{ color: "var(--gold)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Already paid? Activate Pro</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
            Enter the activation code from your payment confirmation.
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Activation code"
              className="input-dark flex-1 text-sm"
            />
            <button
              onClick={handleActivate}
              disabled={activating}
              className="btn-gold flex items-center gap-2 text-sm px-5 shrink-0 disabled:opacity-60"
            >
              {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate"}
            </button>
          </div>
        </div>
      )}

      {isPro && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--gold-10)", border: "1px solid var(--gold-25)" }}>
          <p className="text-sm" style={{ color: "var(--gold-light)" }}>
            Unlimited essay generation is active on <span className="font-semibold">{user?.email}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
