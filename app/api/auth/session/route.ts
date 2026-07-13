import { NextRequest, NextResponse } from "next/server";
import { bearerFrom } from "@/lib/auth/crypto";
import { requireSession } from "@/lib/auth/guards";

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
