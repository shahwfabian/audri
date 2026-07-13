import * as fs from "fs";
import * as path from "path";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { decryptJSON, encryptJSON, issueSession } from "./crypto";
import { assertProductionDatabase, getAdminDatabase } from "@/lib/db/admin";

const USERS_FILE = process.env.AUDRI_USERS_FILE ? path.basename(process.env.AUDRI_USERS_FILE) : "users.json";
const USERS_PATH = path.join(process.cwd(), "data", USERS_FILE);

export const FREE_ESSAY_LIMIT = Math.max(1, parseInt(process.env.AUDRI_FREE_ESSAYS ?? "3", 10) || 3);

export interface StoredUser {
 id: string;
 email: string;
 name: string;
 passwordHash: string;
 plan: "free" | "pro";
 essaysGenerated: number;
 createdAt: string;
 upgradedAt?: string;
 profileEnc?: string;
 workspaceEnc?: string;
 stripeCustomerId?: string;
 stripeSubscriptionId?: string;
 subscriptionStatus?: string;
 sessionVersion: number;
 termsAcceptedAt: string;
 termsVersion: string;
 passwordResetDigest?: string;
 passwordResetExpiresAt?: string;
}

export interface PublicUser {
 id: string;
 email: string;
 name: string;
 plan: "free" | "pro";
 essaysGenerated: number;
 essaysRemaining: number | null;
 createdAt: string;
 token?: string;
}

type DatabaseRow = {
 id: string;
 email: string;
 name: string;
 password_hash: string;
 plan: "free" | "pro";
 essays_generated: number;
 created_at: string;
 upgraded_at?: string | null;
 profile_enc?: string | null;
 workspace_enc?: string | null;
 stripe_customer_id?: string | null;
 stripe_subscription_id?: string | null;
 subscription_status?: string | null;
 session_version?: number | null;
 terms_accepted_at?: string | null;
 terms_version?: string | null;
 password_reset_digest?: string | null;
 password_reset_expires_at?: string | null;
};

const normalize = (email: string) => email.trim().toLowerCase();
let localWriteQueue: Promise<void> = Promise.resolve();

function fromDatabase(row: DatabaseRow): StoredUser {
 return {
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  plan: row.plan,
  essaysGenerated: row.essays_generated,
  createdAt: row.created_at,
  upgradedAt: row.upgraded_at ?? undefined,
  profileEnc: row.profile_enc ?? undefined,
  workspaceEnc: row.workspace_enc ?? undefined,
  stripeCustomerId: row.stripe_customer_id ?? undefined,
  stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
  subscriptionStatus: row.subscription_status ?? undefined,
  sessionVersion: row.session_version ?? 1,
  termsAcceptedAt: row.terms_accepted_at ?? row.created_at,
  termsVersion: row.terms_version ?? "2026-07-13",
  passwordResetDigest: row.password_reset_digest ?? undefined,
  passwordResetExpiresAt: row.password_reset_expires_at ?? undefined,
 };
}

function readLocalUsers(): StoredUser[] {
 try {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8")) as StoredUser[];
 } catch {
  return [];
 }
}

function writeLocalUsers(users: StoredUser[]): void {
 const dir = path.dirname(USERS_PATH);
 fs.mkdirSync(dir, { recursive: true });
 const temporary = `${USERS_PATH}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
 fs.writeFileSync(temporary, JSON.stringify(users, null, 2), "utf-8");
 try {
  for (let attempt = 0; ; attempt += 1) {
   try {
    fs.renameSync(temporary, USERS_PATH);
    break;
   } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    const retryable = code === "EPERM" || code === "EACCES" || code === "EBUSY";
    if (!retryable || attempt >= 5) throw error;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20 * (attempt + 1));
   }
  }
 } finally {
  if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
 }
}

async function updateLocal<T>(mutator: (users: StoredUser[]) => T): Promise<T> {
 let unlock!: () => void;
 const previous = localWriteQueue;
 localWriteQueue = new Promise<void>((resolve) => { unlock = resolve; });
 await previous;
 try {
  const users = readLocalUsers();
  const result = mutator(users);
  writeLocalUsers(users);
  return result;
 } finally {
  unlock();
 }
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

export function toPublic(user: StoredUser, withToken = false): PublicUser {
 return {
  id: user.id,
  email: user.email,
  name: user.name,
  plan: user.plan,
  essaysGenerated: user.essaysGenerated,
  essaysRemaining: user.plan === "pro" ? null : Math.max(0, FREE_ESSAY_LIMIT - user.essaysGenerated),
  createdAt: user.createdAt,
  ...(withToken ? { token: issueSession(user.id, user.email, user.sessionVersion) } : {}),
 };
}

export async function findUser(email: string): Promise<StoredUser | undefined> {
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("audri_users").select("*").eq("email", normalize(email)).maybeSingle();
  if (error) throw new Error(`Could not read customer account: ${error.message}`);
  return data ? fromDatabase(data as DatabaseRow) : undefined;
 }
 assertProductionDatabase();
 await localWriteQueue;
 return readLocalUsers().find((user) => user.email === normalize(email));
}

export async function createUser(email: string, name: string, password: string, acceptedTerms = false): Promise<{ user?: PublicUser; error?: string }> {
 const normalizedEmail = normalize(email);
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { error: "That doesn't look like a valid email address." };
 if (!name.trim()) return { error: "Please enter your name." };
 if (password.length < 10) return { error: "Use at least 10 characters for your password." };
 if (!acceptedTerms) return { error: "Accept the Terms and Privacy Policy to create an account." };

 const created: StoredUser = {
  id: `user_${Date.now()}_${randomBytes(8).toString("hex")}`,
  email: normalizedEmail,
  name: name.trim(),
  passwordHash: hashPassword(password),
  plan: "free",
  essaysGenerated: 0,
  sessionVersion: 1,
  termsAcceptedAt: new Date().toISOString(),
  termsVersion: "2026-07-13",
  createdAt: new Date().toISOString(),
 };

 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("audri_users").insert({
   id: created.id,
   email: created.email,
   name: created.name,
   password_hash: created.passwordHash,
   plan: created.plan,
   essays_generated: 0,
   session_version: 1,
   terms_accepted_at: created.termsAcceptedAt,
   terms_version: created.termsVersion,
   created_at: created.createdAt,
  }).select("*").single();
  if (error?.code === "23505") return { error: "An account with this email already exists. Sign in instead." };
  if (error || !data) throw new Error(`Could not create customer account: ${error?.message ?? "No row returned"}`);
  return { user: toPublic(fromDatabase(data as DatabaseRow), true) };
 }

 assertProductionDatabase();
 return updateLocal((users) => {
  if (users.some((user) => user.email === normalizedEmail)) {
   return { error: "An account with this email already exists. Sign in instead." };
  }
  users.push(created);
  return { user: toPublic(created, true) };
 });
}

export async function authenticate(email: string, password: string): Promise<{ user?: PublicUser; error?: string }> {
 const user = await findUser(email);
 if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Email or password is incorrect." };
 return { user: toPublic(user, true) };
}

export async function verifyAccountPassword(email: string, password: string): Promise<boolean> {
 const user = await findUser(email);
 return Boolean(user && verifyPassword(password, user.passwordHash));
}

export async function checkEssayQuota(email: string): Promise<{ allowed: boolean; remaining: number | null; plan: "free" | "pro" }> {
 const user = await findUser(email);
 if (!user) return { allowed: false, remaining: 0, plan: "free" };
 if (user.plan === "pro") return { allowed: true, remaining: null, plan: "pro" };
 const remaining = FREE_ESSAY_LIMIT - user.essaysGenerated;
 return { allowed: remaining > 0, remaining: Math.max(0, remaining), plan: "free" };
}

export async function reserveEssay(email: string): Promise<{ allowed: boolean; user: PublicUser | null }> {
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.rpc("reserve_audri_essay", { p_email: normalize(email), p_limit: FREE_ESSAY_LIMIT });
  if (error) throw new Error(`Could not reserve essay quota: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (row) return { allowed: true, user: toPublic(fromDatabase(row as DatabaseRow)) };
  const user = await findUser(email);
  return { allowed: false, user: user ? toPublic(user) : null };
 }
 assertProductionDatabase();
 return updateLocal((users) => {
  const user = users.find((candidate) => candidate.email === normalize(email));
  if (!user) return { allowed: false, user: null };
  if (user.plan !== "pro" && user.essaysGenerated >= FREE_ESSAY_LIMIT) return { allowed: false, user: toPublic(user) };
  user.essaysGenerated += 1;
  return { allowed: true, user: toPublic(user) };
 });
}

export async function releaseEssayReservation(email: string): Promise<void> {
 const database = getAdminDatabase();
 if (database) {
  const { error } = await database.rpc("release_audri_essay", { p_email: normalize(email) });
  if (error) throw new Error(`Could not release essay quota: ${error.message}`);
  return;
 }
 assertProductionDatabase();
 await updateLocal((users) => {
  const user = users.find((candidate) => candidate.email === normalize(email));
  if (user && user.essaysGenerated > 0) user.essaysGenerated -= 1;
 });
}

async function saveEncryptedField(email: string, field: "profile_enc" | "workspace_enc", value: unknown): Promise<boolean> {
 const encrypted = encryptJSON(value);
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("audri_users").update({ [field]: encrypted, updated_at: new Date().toISOString() }).eq("email", normalize(email)).select("id").maybeSingle();
  if (error) throw new Error(`Could not save customer data: ${error.message}`);
  return Boolean(data);
 }
 assertProductionDatabase();
 return updateLocal((users) => {
  const user = users.find((candidate) => candidate.email === normalize(email));
  if (!user) return false;
  if (field === "profile_enc") user.profileEnc = encrypted;
  else user.workspaceEnc = encrypted;
  return true;
 });
}

export async function saveUserProfile(email: string, profile: unknown): Promise<boolean> {
 return saveEncryptedField(email, "profile_enc", profile);
}

export async function saveUserWorkspace(email: string, workspace: unknown): Promise<boolean> {
 return saveEncryptedField(email, "workspace_enc", workspace);
}

export async function getUserProfile(email: string): Promise<unknown | null> {
 const user = await findUser(email);
 return decryptJSON(user?.profileEnc);
}

export async function getUserWorkspace(email: string): Promise<unknown | null> {
 const user = await findUser(email);
 return decryptJSON(user?.workspaceEnc);
}

export async function setSubscription(email: string, details: {
 plan: "free" | "pro";
 customerId?: string | null;
 subscriptionId?: string | null;
 status?: string | null;
}): Promise<PublicUser | null> {
 const database = getAdminDatabase();
 const timestamp = new Date().toISOString();
 if (database) {
  const { data, error } = await database.from("audri_users").update({
   plan: details.plan,
   stripe_customer_id: details.customerId,
   stripe_subscription_id: details.subscriptionId,
   subscription_status: details.status,
   upgraded_at: details.plan === "pro" ? timestamp : null,
   updated_at: timestamp,
  }).eq("email", normalize(email)).select("*").maybeSingle();
  if (error) throw new Error(`Could not update subscription: ${error.message}`);
  return data ? toPublic(fromDatabase(data as DatabaseRow)) : null;
 }
 assertProductionDatabase();
 return updateLocal((users) => {
  const user = users.find((candidate) => candidate.email === normalize(email));
  if (!user) return null;
  user.plan = details.plan;
  user.stripeCustomerId = details.customerId ?? undefined;
  user.stripeSubscriptionId = details.subscriptionId ?? undefined;
  user.subscriptionStatus = details.status ?? undefined;
  user.upgradedAt = details.plan === "pro" ? timestamp : undefined;
  return toPublic(user);
 });
}

export async function upgradeToPro(email: string): Promise<PublicUser | null> {
 return setSubscription(email, { plan: "pro", status: "active" });
}

export async function findUserByStripeCustomer(customerId: string): Promise<StoredUser | undefined> {
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("audri_users").select("*").eq("stripe_customer_id", customerId).maybeSingle();
  if (error) throw new Error(`Could not find billing account: ${error.message}`);
  return data ? fromDatabase(data as DatabaseRow) : undefined;
 }
 assertProductionDatabase();
 await localWriteQueue;
 return readLocalUsers().find((user) => user.stripeCustomerId === customerId);
}

function resetDigest(token: string): string {
 return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordReset(email: string): Promise<string | null> {
 const user = await findUser(email);
 if (!user) return null;
 const token = randomBytes(32).toString("base64url");
 const digest = resetDigest(token);
 const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
 const database = getAdminDatabase();
 if (database) {
  const { error } = await database.from("audri_users").update({
   password_reset_digest: digest,
   password_reset_expires_at: expiresAt,
   updated_at: new Date().toISOString(),
  }).eq("email", normalize(email));
  if (error) throw new Error("Could not create password reset: " + error.message);
  return token;
 }
 assertProductionDatabase();
 await updateLocal((users) => {
  const current = users.find((candidate) => candidate.email === normalize(email));
  if (current) {
   current.passwordResetDigest = digest;
   current.passwordResetExpiresAt = expiresAt;
  }
 });
 return token;
}

export async function resetPassword(token: string, password: string): Promise<boolean> {
 if (password.length < 10) return false;
 const digest = resetDigest(token);
 const now = new Date().toISOString();
 const nextHash = hashPassword(password);
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.rpc("reset_audri_password", {
   p_digest: digest,
   p_password_hash: nextHash,
  });
  if (error) throw new Error("Could not reset password: " + error.message);
  return Array.isArray(data) && data.length > 0;
 }
 assertProductionDatabase();
 return updateLocal((users) => {
  const user = users.find((candidate) =>
   candidate.passwordResetDigest === digest &&
   Boolean(candidate.passwordResetExpiresAt) &&
   candidate.passwordResetExpiresAt! > now
  );
  if (!user) return false;
  user.passwordHash = nextHash;
  user.passwordResetDigest = undefined;
  user.passwordResetExpiresAt = undefined;
  user.sessionVersion = (user.sessionVersion || 1) + 1;
  return true;
 });
}

export async function deleteUser(email: string): Promise<boolean> {
 const database = getAdminDatabase();
 if (database) {
  const { data, error } = await database.from("audri_users").delete().eq("email", normalize(email)).select("id").maybeSingle();
  if (error) throw new Error(`Could not delete customer account: ${error.message}`);
  return Boolean(data);
 }
 assertProductionDatabase();
 return updateLocal((users) => {
  const index = users.findIndex((user) => user.email === normalize(email));
  if (index < 0) return false;
  users.splice(index, 1);
  return true;
 });
}

export async function exportUserData(email: string): Promise<Record<string, unknown> | null> {
 const user = await findUser(email);
 if (!user) return null;
 return {
  account: toPublic(user),
  profile: decryptJSON(user.profileEnc),
  workspace: decryptJSON(user.workspaceEnc),
  subscription: {
   status: user.subscriptionStatus ?? null,
   customerId: user.stripeCustomerId ?? null,
   subscriptionId: user.stripeSubscriptionId ?? null,
  },
 };
}
