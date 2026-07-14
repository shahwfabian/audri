import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/ai/functions/parseResume";
import { friendlyError } from "@/lib/errors";
import { guardAIRequest, readJsonBody, requestGuardResponse } from "@/lib/auth/guards";
import { extractResumePdf, MAX_RESUME_PDF_BYTES, ResumePdfError } from "@/lib/resume/pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await guardAIRequest(req, "parse-resume");
    if (!auth.ok) return auth.response;
    const contentType = req.headers.get("content-type") ?? "";
    let text: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const declaredSize = Number(req.headers.get("content-length") ?? 0);
      if (declaredSize > MAX_RESUME_PDF_BYTES + 100_000) {
        return NextResponse.json({ error: "The PDF must be 8 MB or smaller." }, { status: 413 });
      }
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Choose a PDF resume." }, { status: 400 });
      }
      text = await extractResumePdf(file);
    } else {
      const body = await readJsonBody<{ text?: string }>(req, 300_000);
      text = body.text;
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: "No resume text provided." }, { status: 400 });
    }
    const result = await parseResume(text);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ResumePdfError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const guarded = requestGuardResponse(err);
    if (guarded) return guarded;
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
