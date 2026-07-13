import { NextRequest, NextResponse } from "next/server";
import { requireSession, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { getUserWorkspace, saveUserWorkspace } from "@/lib/auth/users";

export async function GET(req: NextRequest) {
 try {
  const session = await requireSession(req);
  if (!session.ok) return session.response;
  return NextResponse.json({ workspace: await getUserWorkspace(session.session.email) });
 } catch (error) {
  return requestGuardResponse(error) ?? NextResponse.json({ error: "Could not load your workspace." }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 try {
  const session = await requireSession(req);
  if (!session.ok) return session.response;
  const body = await readJsonBody<{ workspace?: unknown }>(req, 2_000_000);
  if (!body.workspace || typeof body.workspace !== "object") {
   return NextResponse.json({ error: "Workspace data is required." }, { status: 400 });
  }
  const saved = await saveUserWorkspace(session.session.email, body.workspace);
  if (!saved) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
 } catch (error) {
  return requestGuardResponse(error) ?? NextResponse.json({ error: "Could not save your workspace." }, { status: 500 });
 }
}
