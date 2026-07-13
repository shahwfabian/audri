import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth/users";
import { clientAddress, enforceRateLimit, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";

/** Instant account creation, any email provider, no verification code. */
export async function POST(req: NextRequest) {
 try {
 const limited = enforceRateLimit(`signup:${clientAddress(req)}`, 5, 60 * 60_000);
 if (limited) return limited;
 const body = await readJsonBody<{ email?: string; name?: string; password?: string }>(req, 16_384);
 const { email, name, password } = body;

 if (!email || !name || !password) {
 return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
 }

 const { user, error } = createUser(email, name, password);
 if (error || !user) {
 return NextResponse.json({ error: error ?? "Could not create account." }, { status: 400 });
 }

 return NextResponse.json({ user });
 } catch (err) {
 const guarded = requestGuardResponse(err);
 if (guarded) return guarded;
 return NextResponse.json({ error: "Could not create account." }, { status: 500 });
 }
}
