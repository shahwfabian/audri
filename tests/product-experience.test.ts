import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { friendlyError } from "../lib/errors";

const read = (path: string) => readFileSync(path, "utf8");

test("customer UI contains no provider API-key setup flow", () => {
 const settings = read("app/(dashboard)/settings/page.tsx");
 const layout = read("app/(dashboard)/layout.tsx");
 const paste = read("app/(dashboard)/scholarships/paste/page.tsx");
 const customerUi = `${settings}\n${layout}\n${paste}`;
 assert.doesNotMatch(customerUi, /sk-ant-|x-audri-api-key|bring your own|add (?:your )?api key/i);
 assert.match(settings, /You never need a provider account or API key/);
});

test("AI routes never accept a customer-supplied provider credential", () => {
 const routePaths = [
  "app/api/ai/auto-essay/route.ts",
  "app/api/ai/generate-essay/route.ts",
  "app/api/ai/recommendation/route.ts",
  "app/api/ai/parse-scholarship/route.ts",
  "app/api/scholarships/parse/route.ts",
 ];
 const routes = routePaths.map(read).join("\n");
 assert.doesNotMatch(routes, /x-audri-api-key|apiKeyOverride/);
});

test("provider failures remain customer-friendly", () => {
 const message = friendlyError(new Error("invalid_api_key: provider authentication failed"));
 assert.match(message, /temporarily unavailable/i);
 assert.doesNotMatch(message, /api key|anthropic|settings/i);

 const repeated = friendlyError(new Error(message));
 assert.equal(repeated, message);
});

test("resume import accepts PDFs in profile and onboarding", () => {
 const profile = read("app/(dashboard)/profile/page.tsx");
 const onboarding = read("app/(dashboard)/onboarding/page.tsx");
 const route = read("app/api/ai/parse-resume/route.ts");
 assert.match(profile, /accept="application\/pdf,\.pdf"/);
 assert.match(onboarding, /accept="application\/pdf,\.pdf"/);
 assert.match(route, /multipart\/form-data/);
 assert.match(route, /extractResumePdf/);
});

test("essay generation tolerates partial legacy profiles", () => {
 const source = read("lib/ai/functions/generateEssay.ts");
 assert.match(source, /\(p\.achievements \?\? \[\]\)/);
});

test("students missing essay material get an inline recovery action", () => {
 const page = read("app/(dashboard)/generate/page.tsx");
 const route = read("app/api/ai/auto-essay/route.ts");
 assert.match(page, /needsEssayMaterial/);
 assert.match(page, /Add my detail/);
 assert.match(page, /editor\.focus/);
 assert.match(page, /setSelectionRange/);
 assert.match(page, /aria-controls="essay-specific-notes"/);
 assert.match(page, /htmlFor="essay-specific-notes"/);
 assert.match(route, /ESSAY_MATERIAL_ERROR/);
 assert.ok(route.indexOf("hasEssayMaterial") < route.indexOf("checkEssayQuota(userEmail)"));
});

test("first essay flow states the 2 essay allowance without a manual detour", () => {
 const page = read("app/(dashboard)/generate/page.tsx");
 const signup = read("app/(auth)/signup/page.tsx");
 const users = read("lib/auth/users.ts");
 const env = read(".env.example");
 assert.match(page, /2 essays free/);
 assert.match(signup, /Start with 2 free essays/);
 assert.match(page, /of 2 free/);
 assert.doesNotMatch(page, /Open the Manual/);
 assert.doesNotMatch(page, /one win pays/i);
 assert.match(users, /AUDRI_FREE_ESSAYS \?\? "2"/);
 assert.match(env, /AUDRI_FREE_ESSAYS=2/);
});

test("onboarding completion points students to the first essay", () => {
 const onboarding = read("app/(dashboard)/onboarding/page.tsx");
 assert.match(onboarding, /Your profile is saved/);
 assert.match(onboarding, /Write my first essay/);
 assert.doesNotMatch(onboarding, /Go to my dashboard/);
 assert.doesNotMatch(onboarding, /Next →|Then →|Always →/);
});

test("primary product logo uses the triangle mark", () => {
 const logo = read("components/AudriLogo.tsx");
 assert.match(logo, /M32 7L58 55H6L32 7Z/);
 assert.doesNotMatch(logo, /<text|laurel|four-point/i);
});

test("signup inputs expose accessible labels", () => {
 const signup = read("app/(auth)/signup/page.tsx");
 assert.match(signup, /htmlFor="signup-name"/);
 assert.match(signup, /id="signup-name"/);
 assert.match(signup, /htmlFor="signup-email"/);
 assert.match(signup, /id="signup-email"/);
 assert.match(signup, /htmlFor="signup-password"/);
 assert.match(signup, /id="signup-password"/);
});

test("icon-only product controls have accessible names", () => {
 const layout = read("app/(dashboard)/layout.tsx");
 const dashboard = read("app/(dashboard)/dashboard/page.tsx");
 assert.match(layout, /aria-label="Collapse sidebar"/);
 assert.match(layout, /aria-label="Expand sidebar"/);
 assert.match(layout, /aria-label="Open navigation"/);
 assert.match(layout, /aria-label="Close navigation"/);
 assert.match(layout, /aria-label="Sign out"/);
 assert.match(dashboard, /aria-label="Decrease today's application goal"/);
 assert.match(dashboard, /aria-label="Increase today's application goal"/);
});

test("signed-in navigation becomes an overlay below the desktop breakpoint", () => {
 const layout = read("app/(dashboard)/layout.tsx");
 assert.match(layout, /mobileNavOpen/);
 assert.match(layout, /onOpenChange=\{setMobileNavOpen\}/);
 assert.match(layout, /hidden lg:flex/);
 assert.match(layout, /className="lg:hidden mr-4 transition-colors"/);
 assert.match(layout, /className="min-w-0 flex-1 overflow-y-auto"/);
 assert.match(layout, /onNavigate=\{\(\) => setMobileNavOpen\(false\)\}/);
});
