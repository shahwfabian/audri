import { PDFParse } from "pdf-parse";

export const MAX_RESUME_PDF_BYTES = 8 * 1024 * 1024;
export const MAX_RESUME_TEXT_CHARS = 200_000;

export class ResumePdfError extends Error {}

export async function extractResumePdf(file: File): Promise<string> {
 if (file.size === 0) throw new ResumePdfError("That PDF is empty.");
 if (file.size > MAX_RESUME_PDF_BYTES) {
  throw new ResumePdfError("The PDF must be 8 MB or smaller.");
 }

 const hasPdfType = file.type === "application/pdf";
 const hasPdfName = file.name.toLowerCase().endsWith(".pdf");
 if (!hasPdfType && !hasPdfName) {
  throw new ResumePdfError("Choose a PDF resume.");
 }

 const parser = new PDFParse({
  data: new Uint8Array(await file.arrayBuffer()),
  isEvalSupported: false,
  stopAtErrors: true,
 });

 try {
  const result = await parser.getText();
  const text = result.text.replace(/\u0000/g, "").trim();
  if (text.length < 30) {
   throw new ResumePdfError("We could not find readable text in that PDF. Upload a text-based PDF or paste the resume text.");
  }
  return text.slice(0, MAX_RESUME_TEXT_CHARS);
 } catch (error) {
  if (error instanceof ResumePdfError) throw error;
  throw new ResumePdfError("We could not read that PDF. Try another file or paste the resume text.");
 } finally {
  await parser.destroy().catch(() => undefined);
 }
}
