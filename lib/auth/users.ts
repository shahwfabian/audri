/**
 * Real account system, file-backed user store.
 *
 * Students sign up with ANY email address (Gmail, Yahoo, school, whatever)
 * and a password. Accounts are created instantly, no verification codes,
 * no confirmation emails. Passwords are scrypt-hashed; plaintext is never
 * stored. This same store powers the paywall: each user carries a plan
 * ("free" | "pro") and a lifetime essay count enforced server-side.
 */

import * as fs from "fs";
import * as path from "path";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { encryptJSON, decryptJSON, issueSession } from "./crypto";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

/** Free-tier essay allowance. Override with AUDRI_FREE_ESSAYS in .env.local. */
export const FREE_ESSAY_LIMIT = Math.max(1, parseInt(process.env.AUDRI_FREE_ESSAYS ?? "3", 10) || 3);

export interface StoredUser {
 id: string;
 email: string;
 name: string;
 passwordHash: string; // "salt:hash" (scrypt)
 plan: "free" | "pro";
 essaysGenerated: number;
 createdAt: string;
 upgradedAt?: string;
 /** The student's scholarship profile, AES-256-GCM encrypted at rest (never plaintext on disk) */
 profileEnc?: string;
}

export interface PublicUser {
 id: string;
 email: string;
 name: string;
 plan: "free" | "pro";
 essaysGenerated: number;
 essaysRemaining: number | null; // null = unlimited (pro)
 createdAt: string;
 /** Signed session token, proves identity to protected endpoints */
 token?: string;
}

function readUsers(): StoredUser[] {
 try {
 if (!fs.existsSync(USERS_PATH)) return [];
 return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8")) as StoredUser[];
 } catch {
 return [];
 }
}

function writeUsers(users: StoredUser[]): void {
 const dir = path.dirname(USERS_PATH);
 if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
 fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

function hashPassword(password: string): string {
 const salt = randomBytes(16).toString("hex");
 const hash = scryptSync(password, salt, 64).toString("hex");
 return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
 const [salt, hash] = stored.split(":");
 if (!salt || !hash) return false;
 const candidate = scryptSync(password, salt, 64);
 const expected = Buffer.from(hash, "hex");
 return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function toPublic(u: StoredUser, withToken = false): PublicUser {
 return {
 id: u.id,
 email: u.email,
 name: u.name,
 plan: u.plan,
 essaysGenerated: u.essaysGenerated,
 essaysRemaining: u.plan === "pro" ? null : Math.max(0, FREE_ESSAY_LIMIT - u.essaysGenerated),
 createdAt: u.createdAt,
 ...(withToken ? { token: issueSession(u.id, u.email) } : {}),
 };
}

const normalize = (email: string) => email.trim().toLowerCase();

export function findUser(email: string): StoredUser | undefined {
 return readUsers().find((u) => u.email === normalize(email));
}

export function createUser(email: string, name: string, password: string): { user?: PublicUser; error?: string } {
 const e = normalize(email);
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { error: "That doesn't look like a valid email address." };
 if (!name.trim()) return { error: "Please enter your name." };
 if (password.length < 6) return { error: "Password needs at least 6 characters." };

 const users = readUsers();
 if (users.some((u) => u.email === e)) {
 return { error: "An account with this email already exists, sign in instead." };
 }

 const user: StoredUser = {
 id: `user_${Date.now()}_${randomBytes(4).toString("hex")}`,
 email: e,
 name: name.trim(),
 passwordHash: hashPassword(password),
 plan: "free",
 essaysGenerated: 0,
 createdAt: new Date().toISOString(),
 };

 users.push(user);
 writeUsers(users);
 return { user: toPublic(user, true) };
}

export function authenticate(email: string, password: string): { user?: PublicUser; error?: string } {
 const u = findUser(email);
 if (!u || !verifyPassword(password, u.passwordHash)) {
 return { error: "Email or password is incorrect." };
 }
 return { user: toPublic(u, true) };
}

/**
 * Paywall gate. Returns whether this user may generate another essay.
 * Unknown users (legacy demo sessions) get created implicitly as free users
 * so the quota still applies to them.
 */
export function checkEssayQuota(email: string): { allowed: boolean; remaining: number | null; plan: "free" | "pro" } {
 const u = findUser(email);
 if (!u) {
 // Legacy/demo session with no server account, allow within the free
 // limit by creating a shadow record keyed to the email.
 const users = readUsers();
 const shadow: StoredUser = {
 id: `user_${Date.now()}_${randomBytes(4).toString("hex")}`,
 email: normalize(email),
 name: email.split("@")[0],
 passwordHash: hashPassword(randomBytes(12).toString("hex")),
 plan: "free",
 essaysGenerated: 0,
 createdAt: new Date().toISOString(),
 };
 users.push(shadow);
 writeUsers(users);
 return { allowed: true, remaining: FREE_ESSAY_LIMIT, plan: "free" };
 }
 if (u.plan === "pro") return { allowed: true, remaining: null, plan: "pro" };
 const remaining = FREE_ESSAY_LIMIT - u.essaysGenerated;
 return { allowed: remaining > 0, remaining: Math.max(0, remaining), plan: "free" };
}

/** Record a successful essay generation against the user's quota. */
export function recordEssay(email: string): PublicUser | null {
 const users = readUsers();
 const u = users.find((x) => x.email === normalize(email));
 if (!u) return null;
 u.essaysGenerated += 1;
 writeUsers(users);
 return toPublic(u);
}

/** Persist the student's profile on their account, ENCRYPTED at rest. Survives devices and sessions. */
export function saveUserProfile(email: string, profile: unknown): boolean {
 const users = readUsers();
 const u = users.find((x) => x.email === normalize(email));
 if (!u) return false;
 u.profileEnc = encryptJSON(profile);
 writeUsers(users);
 return true;
}

export function getUserProfile(email: string): unknown | null {
 const u = findUser(email);
 if (!u?.profileEnc) return null;
 return decryptJSON(u.profileEnc);
}

/** Upgrade a user to pro (called after payment via the activation endpoint / Stripe webhook). */
export function upgradeToPro(email: string): PublicUser | null {
 const users = readUsers();
 const u = users.find((x) => x.email === normalize(email));
 if (!u) return null;
 u.plan = "pro";
 u.upgradedAt = new Date().toISOString();
 writeUsers(users);
 return toPublic(u);
}
