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

test("students missing essay material get an inline quality nudge without blocking generation", () => {
 const page = read("app/(dashboard)/generate/page.tsx");
 const route = read("app/api/ai/auto-essay/route.ts");
 const generator = read("lib/ai/functions/generateEssay.ts");
 assert.match(page, /needsEssayMaterial/);
 assert.match(page, /Want a stronger draft/);
 assert.match(page, /Audri will draft with clean blanks/);
 assert.match(page, /Add a detail/);
 assert.match(page, /editor\.focus/);
 assert.match(page, /setSelectionRange/);
 assert.match(page, /aria-controls="essay-specific-notes"/);
 assert.match(page, /htmlFor="essay-specific-notes"/);
 assert.doesNotMatch(route, /ESSAY_MATERIAL_ERROR|hasEssayMaterial/);
 assert.match(generator, /Use bracketed fill-ins for missing student facts/);
 assert.match(generator, /isNonEssayResponse/);
});

test("first essay flow states the weekly 2 essay allowance without a manual detour", () => {
 const page = read("app/(dashboard)/generate/page.tsx");
 const signup = read("app/(auth)/signup/page.tsx");
 const users = read("lib/auth/users.ts");
 const env = read(".env.example");
 assert.match(page, /2 essays free every 7 days/);
 assert.match(signup, /Start with 2 free essays every 7 days/);
 assert.match(page, /of 2 weekly/);
 assert.doesNotMatch(page, /Open the Manual/);
 assert.doesNotMatch(page, /How it works/);
 assert.doesNotMatch(page, /one win pays/i);
 assert.match(users, /AUDRI_FREE_ESSAYS \?\? "2"/);
 assert.match(users, /FREE_ESSAY_WINDOW_MS = 7/);
 assert.match(env, /AUDRI_FREE_ESSAYS=2/);
});

test("upgrade page defines the three paid plans", () => {
 const page = read("app/(dashboard)/upgrade/page.tsx");
 const plans = read("lib/billing/plans.ts");
 assert.match(page, /Choose your scholarship season/);
 assert.match(plans, /id: "student"[\s\S]*price: "\$9"/);
 assert.match(plans, /id: "power"[\s\S]*price: "\$19"/);
 assert.match(plans, /id: "sprint"[\s\S]*price: "\$49"[\s\S]*durationMonths: 4/);
 assert.match(plans, /Four months of Pro access/);
});

test("first session navigation keeps only the core product paths", () => {
 const layout = read("app/(dashboard)/layout.tsx");
 assert.match(layout, /Essay Generator/);
 assert.match(layout, /Find Scholarships/);
 assert.match(layout, /My Profile/);
 assert.match(layout, /Essays/);
 assert.match(layout, /Settings/);
 assert.doesNotMatch(layout, /label: "The Manual"|label: "Dashboard"|label: "Paste & Analyze"|label: "Story Studio"|label: "Story Vault"|label: "Rec Letters"|label: "Gap Analysis"|label: "Resume Builder"/);
});

test("generator keeps fallback paste and voice controls collapsed", () => {
 const page = read("app/(dashboard)/generate/page.tsx");
 assert.match(page, /showPasteFallback/);
 assert.match(page, /Can&apos;t use a link\? Paste scholarship details instead/);
 assert.match(page, /showVoiceControls/);
 assert.match(page, /Adjust voice/);
 assert.match(page, /aria-controls="scholarship-paste-fallback"/);
 assert.match(page, /aria-controls="voice-controls"/);
 assert.doesNotMatch(page, /The entire scholarship page/);
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

test("scholarship search removes no-essay positioning and ranks fit", () => {
 const page = read("app/(dashboard)/scholarships/search/page.tsx");
 const route = read("app/api/scholarships/route.ts");
 assert.doesNotMatch(page, /"No Essay"|No essay/);
 assert.match(page, /rankScholarship/);
 assert.match(page, /Matched on/);
 assert.match(route, /filterSeriousScholarships/);
});

test("tone picker defaults to featured voices before the full catalogue", () => {
 const picker = read("components/TonePicker.tsx");
 assert.match(picker, /Featured voices/);
 assert.match(picker, /Open full voice catalogue/);
 assert.doesNotMatch(picker, /1,440 voices|TONE_COUNT\.toLocaleString\(\) voices/);
});
