import { NextRequest, NextResponse } from "next/server";
import { bearerFrom, verifySession, type Session } from "./crypto";

const DEFAULT_JSON_LIMIT = 256 * 1024;

interface RateWindow {
 count: number;
 resetAt: number;
}

const globalRateStore = globalThis as typeof globalThis & {
 __audriRateLimits?: Map<string, RateWindow>;
};

const rateLimits = globalRateStore.__audriRateLimits ?? new Map<string, RateWindow>();
globalRateStore.__audriRateLimits = rateLimits;

export class RequestGuardError extends Error {
 constructor(
 message: string,
 public readonly status: number
 ) {
 super(message);
 }
}

export type SessionGuard =
 | { ok: true; session: Session }
 | { ok: false; response: NextResponse };

export function requireSession(req: NextRequest | Request): SessionGuard {
 const session = verifySession(bearerFrom(req.headers.get("authorization")));
 if (!session) {
 return {
 ok: false,
 response: NextResponse.json(
 { error: "Not authorized. Please sign in again." },
 { status: 401 }
 ),
 };
 }
 return { ok: true, session };
}

export function clientAddress(req: NextRequest | Request): string {
 const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
 return forwarded || req.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(
 key: string,
 limit: number,
 windowMs: number
): NextResponse | null {
 const now = Date.now();
 if (rateLimits.size > 5_000) {
 for (const [storedKey, window] of rateLimits) {
 if (window.resetAt <= now) rateLimits.delete(storedKey);
 }
 while (rateLimits.size > 10_000) {
 const oldestKey = rateLimits.keys().next().value as string | undefined;
 if (!oldestKey) break;
 rateLimits.delete(oldestKey);
 }
 }
 const current = rateLimits.get(key);

 if (!current || current.resetAt <= now) {
 rateLimits.set(key, { count: 1, resetAt: now + windowMs });
 return null;
 }

 current.count += 1;
 if (current.count <= limit) return null;

 const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
 return NextResponse.json(
 { error: "Too many requests. Wait a moment and try again." },
 { status: 429, headers: { "Retry-After": String(retryAfter) } }
 );
}

export function guardAIRequest(
 req: NextRequest | Request,
 routeName: string,
 limit = 20
): SessionGuard {
 const auth = requireSession(req);
 if (!auth.ok) return auth;

 const limited = enforceRateLimit(
 `ai:${routeName}:${auth.session.userId}`,
 limit,
 60_000
 );
 if (limited) return { ok: false, response: limited };
 return auth;
}

export async function readJsonBody<T = Record<string, unknown>>(
 req: NextRequest | Request,
 maxBytes = DEFAULT_JSON_LIMIT
): Promise<T> {
 const declaredLength = Number(req.headers.get("content-length") || "0");
 if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
 throw new RequestGuardError("Request body is too large.", 413);
 }

 const raw = await req.text();
 if (Buffer.byteLength(raw, "utf8") > maxBytes) {
 throw new RequestGuardError("Request body is too large.", 413);
 }
 if (!raw.trim()) return {} as T;

 try {
 return JSON.parse(raw) as T;
 } catch {
 throw new RequestGuardError("Request body must be valid JSON.", 400);
 }
}

export function requestGuardResponse(err: unknown): NextResponse | null {
 if (!(err instanceof RequestGuardError)) return null;
 return NextResponse.json({ error: err.message }, { status: err.status });
}

export function resetRateLimitsForTests(): void {
 rateLimits.clear();
}
