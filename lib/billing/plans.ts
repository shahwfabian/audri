export type BillingPlanId = "student" | "power" | "sprint";

export type BillingPlan = {
 id: BillingPlanId;
 name: string;
 price: string;
 cadence: string;
 checkoutMode: "subscription" | "payment";
 priceEnv: string;
 legacyPriceEnv?: string;
 monthlyEssayLimit: number;
 badge?: string;
 durationMonths?: number;
 features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
 {
  id: "student",
  name: "Student",
  price: "$9",
  cadence: "month",
  checkoutMode: "subscription",
  priceEnv: "STRIPE_STUDENT_PRICE_ID",
  legacyPriceEnv: "STRIPE_PRO_PRICE_ID",
  monthlyEssayLimit: 30,
  features: [
   "Room for steady weekly essay drafting",
   "Funder research on every essay",
   "Saved drafts and rewrite support",
   "Best for steady weekly applications",
  ],
 },
 {
  id: "power",
  name: "Power Applicant",
  price: "$19",
  cadence: "month",
  checkoutMode: "subscription",
  priceEnv: "STRIPE_POWER_PRICE_ID",
  monthlyEssayLimit: 100,
  badge: "For application season",
  features: [
   "Everything in Student",
   "Higher-volume scholarship workflow",
   "Designed for students applying in volume",
   "Best for seniors, transfers, and grad applicants",
  ],
 },
 {
  id: "sprint",
  name: "Scholarship Sprint",
  price: "$49",
  cadence: "4 months",
  checkoutMode: "payment",
  priceEnv: "STRIPE_SPRINT_PRICE_ID",
  badge: "One season",
  durationMonths: 4,
  monthlyEssayLimit: 100,
  features: [
   "Four months of Pro access",
   "One payment, no monthly renewal",
   "Built for peak scholarship season",
   "Best for students who want one focused push",
  ],
 },
];

export const DEFAULT_BILLING_PLAN_ID: BillingPlanId = "student";

export function getBillingPlan(planId: unknown): BillingPlan {
 const normalized = typeof planId === "string" ? planId : DEFAULT_BILLING_PLAN_ID;
 return BILLING_PLANS.find((plan) => plan.id === normalized) ?? BILLING_PLANS[0];
}

export function getBillingPriceId(plan: BillingPlan): string | undefined {
 return process.env[plan.priceEnv] || (plan.legacyPriceEnv ? process.env[plan.legacyPriceEnv] : undefined);
}

export function sprintExpiry(from = new Date()): string {
 const expires = new Date(from);
 expires.setMonth(expires.getMonth() + 4);
 return expires.toISOString();
}
