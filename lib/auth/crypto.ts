/**
 * Encryption + session signing for Audri.
 *
 * - Every student's PII (their scholarship profile) is encrypted at rest with
 * AES-256-GCM. Plaintext PII never touches disk.
 * - Sessions are stateless signed tokens (HMAC-SHA256). A token proves the
 * caller IS a specific account, so security-sensitive endpoints derive
 * identity from the token and NEVER trust a client-supplied email. This is
 * what guarantees one student can never read or touch another's data.
 *
 * The master secret comes from AUDRI_SECRET in .env.local. If unset (local
 * dev), a strong random secret is generated once and persisted to data/.secret
 * so tokens and ciphertext stay valid across restarts.
 */

import * as fs from "fs";
import * as path from "path";
import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SECRET_FILE = path.join(process.cwd(), "data", ".secret");

function loadMasterSecret(): string {
 const fromEnv = process.env.AUDRI_SECRET;
 if (fromEnv && fromEnv !== "your_audri_secret_here" && fromEnv.length >= 16) return fromEnv;

 try {
 if (fs.existsSync(SECRET_FILE)) return fs.readFileSync(SECRET_FILE, "utf-8").trim();
 const generated = randomBytes(48).toString("hex");
 fs.mkdirSync(path.dirname(SECRET_FILE), { recursive: true });
 fs.writeFileSync(SECRET_FILE, generated, "utf-8");
 return generated;
 } catch {
 // Last resort for read-only environments, process-lifetime secret.
 return randomBytes(48).toString("hex");
 }
}

const MASTER = loadMasterSecret();
// Separate 32-byte keys for encryption vs signing, both derived from the master.
const ENC_KEY = scryptSync(MASTER, "audri-enc-v1", 32);
const SIGN_KEY = scryptSync(MASTER, "audri-sign-v1", 32);

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// ── Encryption at rest (AES-256-GCM) ─────────────────────────────────────────

/** Encrypt any JSON-serialisable value. Returns a compact "v1:iv:tag:cipher" string. */
export function encryptJSON(value: unknown): string {
 const iv = randomBytes(12);
 const cipher = createCipheriv("aes-256-gcm", ENC_KEY, iv);
 const plaintext = Buffer.from(JSON.stringify(value), "utf-8");
 const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
 const tag = cipher.getAuthTag();
 return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/** Decrypt a value produced by encryptJSON. Returns null if tampered/undecipherable. */
export function decryptJSON<T = unknown>(blob: string | undefined | null): T | null {
 if (!blob || typeof blob !== "string" || !blob.startsWith("v1:")) return null;
 try {
 const [, ivB64, tagB64, dataB64] = blob.split(":");
 const decipher = createDecipheriv("aes-256-gcm", ENC_KEY, Buffer.from(ivB64, "base64"));
 decipher.setAuthTag(Buffer.from(tagB64, "base64"));
 const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
 return JSON.parse(decrypted.toString("utf-8")) as T;
 } catch {
 return null;
 }
}

// ── Stateless signed sessions (HMAC-SHA256) ──────────────────────────────────

function sign(payload: string): string {
 return createHmac("sha256", SIGN_KEY).update(payload).digest("base64url");
}

export interface Session {
 userId: string;
 email: string;
}

/** Issue a session token that binds this userId + email for 30 days. */
export function issueSession(userId: string, email: string): string {
 const claims = { u: userId, e: email.toLowerCase(), x: Date.now() + SESSION_TTL_MS };
 // JSON-encode so values containing dots (emails!) survive round-tripping.
 const b64 = Buffer.from(JSON.stringify(claims), "utf-8").toString("base64url");
 return `${b64}.${sign(b64)}`;
}

/** Verify a token. Returns the identity it proves, or null if invalid/expired/tampered. */
export function verifySession(token: string | undefined | null): Session | null {
 if (!token || typeof token !== "string" || !token.includes(".")) return null;
 const lastDot = token.lastIndexOf(".");
 const b64 = token.slice(0, lastDot);
 const providedSig = token.slice(lastDot + 1);

 const expectedSig = sign(b64);
 const a = Buffer.from(providedSig);
 const b = Buffer.from(expectedSig);
 if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

 try {
 const claims = JSON.parse(Buffer.from(b64, "base64url").toString("utf-8")) as { u: string; e: string; x: number };
 if (!claims.u || !claims.e || typeof claims.x !== "number" || Date.now() > claims.x) return null;
 return { userId: claims.u, email: claims.e };
 } catch {
 return null;
 }
}

/** Pull the bearer token out of an Authorization header. */
export function bearerFrom(header: string | null): string | undefined {
 if (!header) return undefined;
 const m = header.match(/^Bearer\s+(.+)$/i);
 return m ? m[1] : undefined;
}
