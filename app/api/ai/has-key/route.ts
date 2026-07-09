import { NextResponse } from "next/server";
import { hasServerKey } from "@/lib/ai/client";

/** Lets the client know AI is already enabled server-side (no student key needed). */
export async function GET() {
  return NextResponse.json({ hasKey: hasServerKey() });
}
