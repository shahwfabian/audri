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

test("primary product logo uses the triangle mark", () => {
 const logo = read("components/AudriLogo.tsx");
 assert.match(logo, /M32 7L58 55H6L32 7Z/);
 assert.doesNotMatch(logo, /<text|laurel|four-point/i);
});

test("icon-only product controls have accessible names", () => {
 const layout = read("app/(dashboard)/layout.tsx");
 const dashboard = read("app/(dashboard)/dashboard/page.tsx");
 assert.match(layout, /aria-label="Collapse sidebar"/);
 assert.match(layout, /aria-label="Expand sidebar"/);
 assert.match(layout, /aria-label="Sign out"/);
 assert.match(dashboard, /aria-label="Decrease today's application goal"/);
 assert.match(dashboard, /aria-label="Increase today's application goal"/);
});
