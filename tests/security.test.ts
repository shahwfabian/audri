import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import path from "node:path";
import test, { after, before } from "node:test";
import { unlinkSync } from "node:fs";

const usersFile = `users.test.${randomUUID()}.json`;
const usersPath = path.join(process.cwd(), "data", usersFile);
process.env.AUDRI_USERS_FILE = usersFile;
process.env.AUDRI_SECRET = "audri-test-master-secret-with-sufficient-length";
process.env.AUDRI_FREE_ESSAYS = "2";
process.env.AUDRI_ACTIVATION_SECRET = "test-activation-code";

let cryptoModule: typeof import("../lib/auth/crypto");
let usersModule: typeof import("../lib/auth/users");
let guardsModule: typeof import("../lib/auth/guards");
let urlModule: typeof import("../lib/scrapers/publicUrl");
let billingRoute: typeof import("../app/api/billing/activate/route");
let parseResumeRoute: typeof import("../app/api/ai/parse-resume/route");
let scrapeRoute: typeof import("../app/api/scholarships/scrape/route");
let styleModule: typeof import("../lib/ai/style");
let loginRoute: typeof import("../app/api/auth/login/route");
let NextRequest: typeof import("next/server").NextRequest;

before(async () => {
 cryptoModule = await import("../lib/auth/crypto");
 usersModule = await import("../lib/auth/users");
 guardsModule = await import("../lib/auth/guards");
 urlModule = await import("../lib/scrapers/publicUrl");
 billingRoute = await import("../app/api/billing/activate/route");
 parseResumeRoute = await import("../app/api/ai/parse-resume/route");
 scrapeRoute = await import("../app/api/scholarships/scrape/route");
 styleModule = await import("../lib/ai/style");
 loginRoute = await import("../app/api/auth/login/route");
 ({ NextRequest } = await import("next/server"));
});

after(() => {
 try {
 unlinkSync(usersPath);
 } catch {}
});

test("signed sessions reject tampering", () => {
 const token = cryptoModule.issueSession("user_test", "student@example.com");
 assert.deepEqual(cryptoModule.verifySession(token), {
 userId: "user_test",
 email: "student@example.com",
 sessionVersion: 1,
 });
 assert.equal(cryptoModule.verifySession(`${token}tampered`), null);
});

test("protected AI routes reject anonymous requests before provider work", async () => {
 const req = new NextRequest("http://localhost/api/ai/parse-resume", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ text: "A sufficiently long resume body" }),
 });
 const response = await parseResumeRoute.POST(req);
 assert.equal(response.status, 401);
});

test("quota reservation is bounded and can be rolled back", async () => {
 const created = await usersModule.createUser("quota@example.com", "Quota Student", "strong-password", true);
 assert.ok(created.user?.token);

 assert.equal((await usersModule.reserveEssay("quota@example.com")).allowed, true);
 assert.equal((await usersModule.reserveEssay("quota@example.com")).allowed, true);
 assert.equal((await usersModule.reserveEssay("quota@example.com")).allowed, false);

 await usersModule.releaseEssayReservation("quota@example.com");
 assert.equal((await usersModule.reserveEssay("quota@example.com")).allowed, true);
});

test("billing requires a session and ignores query-string identity", async () => {
 const first = (await usersModule.createUser("first@example.com", "First Student", "strong-password", true)).user;
 await usersModule.createUser("second@example.com", "Second Student", "strong-password", true);
 assert.ok(first?.token);

 const anonymous = await billingRoute.GET(
 new NextRequest("http://localhost/api/billing/activate?email=second@example.com")
 );
 assert.equal(anonymous.status, 401);

 const authorized = await billingRoute.GET(
 new NextRequest("http://localhost/api/billing/activate?email=second@example.com", {
 headers: { Authorization: `Bearer ${first!.token}` },
 })
 );
 assert.equal(authorized.status, 200);
 const body = await authorized.json();
 assert.equal(body.user.email, "first@example.com");
});

test("billing activation cannot fall back to a client email", async () => {
 const response = await billingRoute.POST(
 new NextRequest("http://localhost/api/billing/activate", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email: "second@example.com", code: "test-activation-code" }),
 })
 );
 assert.equal(response.status, 401);
});

test("login moves the session into an HTTP-only cookie", async () => {
 const response = await loginRoute.POST(new NextRequest("http://localhost/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "first@example.com", password: "strong-password" }),
 }));
 assert.equal(response.status, 200);
 const setCookie = response.headers.get("set-cookie") ?? "";
 assert.match(setCookie, /audri_session=/);
 assert.match(setCookie, /HttpOnly/i);
 const cookie = setCookie.split(";")[0];
 const authorized = await billingRoute.GET(new NextRequest("http://localhost/api/billing/activate", {
  headers: { Cookie: cookie },
 }));
 assert.equal(authorized.status, 200);
});

test("session guard accepts cookies from a standard Request", async () => {
 const created = await usersModule.createUser("cookie-request@example.com", "Cookie Student", "strong-password", true);
 assert.ok(created.user?.token);
 const guarded = await guardsModule.requireSession(new Request("http://localhost/protected", {
  headers: { Cookie: `audri_session=${created.user!.token}` },
 }));
 assert.equal(guarded.ok, true);
});

test("login can use a browser-session cookie when remember me is off", async () => {
 const response = await loginRoute.POST(new NextRequest("http://localhost/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "first@example.com", password: "strong-password", remember: false }),
 }));
 assert.equal(response.status, 200);
 const setCookie = response.headers.get("set-cookie") ?? "";
 assert.match(setCookie, /audri_session=/);
 assert.doesNotMatch(setCookie, /Max-Age/i);
});

test("administrative scraper fails closed", async () => {
 const original = process.env.CRON_SECRET;
 delete process.env.CRON_SECRET;
 const unconfigured = await scrapeRoute.POST(
 new NextRequest("http://localhost/api/scholarships/scrape", { method: "POST" })
 );
 assert.equal(unconfigured.status, 503);

 process.env.CRON_SECRET = "cron-test-secret";
 const unauthorized = await scrapeRoute.POST(
 new NextRequest("http://localhost/api/scholarships/scrape", { method: "POST" })
 );
 assert.equal(unauthorized.status, 401);
 if (original === undefined) delete process.env.CRON_SECRET;
 else process.env.CRON_SECRET = original;
});

test("public URL policy blocks local and private network targets", async () => {
 const blocked = [
 "http://localhost/scholarship",
 "http://127.0.0.1/scholarship",
 "http://10.0.0.1/scholarship",
 "http://169.254.169.254/latest/meta-data",
 "http://[::1]/scholarship",
 "https://user:password@example.com/scholarship",
 ];

 for (const candidate of blocked) {
 await assert.rejects(() => urlModule.assertPublicHttpUrl(candidate), urlModule.UnsafeUrlError);
 }
});

test("request parser rejects oversized JSON", async () => {
 const request = new Request("http://localhost/test", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ value: "1234567890" }),
 });
 await assert.rejects(
 () => guardsModule.readJsonBody(request, 8),
 (err: unknown) => err instanceof guardsModule.RequestGuardError && err.status === 413
 );
});

test("rate limiter returns retry guidance after the allowed window count", async () => {
 guardsModule.resetRateLimitsForTests();
 assert.equal(await guardsModule.enforceRateLimit("test-bucket", 2, 60_000), null);
 assert.equal(await guardsModule.enforceRateLimit("test-bucket", 2, 60_000), null);
 const blocked = await guardsModule.enforceRateLimit("test-bucket", 2, 60_000);
 assert.equal(blocked?.status, 429);
 assert.ok(blocked?.headers.get("Retry-After"));
});

test("account creation requires terms acceptance", async () => {
 const result = await usersModule.createUser("terms@example.com", "Terms Student", "strong-password");
 assert.equal(result.user, undefined);
 assert.match(result.error ?? "", /Terms/);
});

test("workspace data is encrypted and restored", async () => {
 await usersModule.createUser("workspace@example.com", "Workspace Student", "strong-password", true);
 const workspace = { savedScholarships: [{ id: "scholarship-1", name: "Local Award" }], onboardingComplete: true };
 assert.equal(await usersModule.saveUserWorkspace("workspace@example.com", workspace), true);
 assert.deepEqual(await usersModule.getUserWorkspace("workspace@example.com"), workspace);
});

test("password reset invalidates existing sessions", async () => {
 const created = await usersModule.createUser("reset@example.com", "Reset Student", "strong-password", true);
 assert.ok(created.user?.token);
 const token = await usersModule.createPasswordReset("reset@example.com");
 assert.ok(token);
 assert.equal(await usersModule.resetPassword(token!, "different-strong-password"), true);
 const guard = await guardsModule.requireSession(new Request("http://localhost/protected", {
  headers: { Authorization: "Bearer " + created.user!.token },
 }));
 assert.equal(guard.ok, false);
});

test("word limit clamp never exceeds the portal limit", () => {
 const text = Array.from({ length: 120 }, (_, index) => "word" + index).join(" ");
 const clamped = styleModule.clampToWordLimit(text, 75);
 assert.ok(styleModule.countWords(clamped) <= 75);
});
