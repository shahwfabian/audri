import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth/users";

/** Instant account creation — any email provider, no verification code. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, name, password } = body;

  if (!email || !name || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  const { user, error } = createUser(email, name, password);
  if (error || !user) {
    return NextResponse.json({ error: error ?? "Could not create account." }, { status: 400 });
  }

  return NextResponse.json({ user });
}
