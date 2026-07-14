import { getAdminDatabase } from "@/lib/db/admin";

const normalize = (email: string) => email.trim().toLowerCase();

export async function sendSignupVerificationCode(email: string): Promise<void> {
 const database = getAdminDatabase();
 if (!database) throw new Error("Production database is not configured.");

 const { error } = await database.auth.signInWithOtp({
  email: normalize(email),
  options: { shouldCreateUser: true },
 });
 if (error) throw new Error(`Could not send verification code: ${error.message}`);
}

export const sendPasswordResetCode = sendSignupVerificationCode;

export async function verifySignupCode(email: string, code: string): Promise<boolean> {
 const database = getAdminDatabase();
 if (!database) throw new Error("Production database is not configured.");

 const normalizedEmail = normalize(email);
 const { data, error } = await database.auth.verifyOtp({
  email: normalizedEmail,
  token: code,
  type: "email",
 });
 if (error || !data.user?.email) return false;
 return normalize(data.user.email) === normalizedEmail;
}

export const verifyPasswordResetCode = verifySignupCode;
