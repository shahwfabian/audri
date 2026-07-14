import { NextRequest, NextResponse } from "next/server";
import { bearerFrom } from "@/lib/auth/crypto";
import { requireSession } from "@/lib/auth/guards";
import { findUser, getUserProfile, getUserWorkspace, toPublic } from "@/lib/auth/users";

export async function GET(req: NextRequest) {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;
 const user = await findUser(auth.session.email);
 if (!user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });
 return NextResponse.json({
  user: toPublic(user),
  profile: await getUserProfile(auth.session.email),
  workspace: await getUserWorkspace(auth.session.email),
 });
}

export async function POST(req: NextRequest) {
 const auth = await requireSession(req);
 if (!auth.ok) return auth.response;
 const token = bearerFrom(req.headers.get("authorization"));
 if (!token) return NextResponse.json({ ok: true });
 const response = NextResponse.json({ ok: true });
 response.cookies.set("audri_session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
 });
 return response;
}

export async function DELETE() {
 const response = NextResponse.json({ ok: true });
 response.cookies.set("audri_session", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: new Date(0),
  path: "/",
 });
 return response;
}
