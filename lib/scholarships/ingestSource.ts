// lib/scholarships/ingestSource.ts

import { fetchSourceText } from "./fetchSourceText";
import { parseScholarshipWithAI } from "./parseScholarshipWithAI";
import { upsertScholarship } from "./upsertScholarship";
import type { ScholarshipRow } from "./types";

function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

export async function ingestSource(
  source: { name: string; url: string; type: string },
  apiKey?: string
): Promise<ScholarshipRow[]> {
  const text = await fetchSourceText(source.url);
  const chunks = chunkText(text, 6000);
  const results: ScholarshipRow[] = [];

  for (const chunk of chunks) {
    // Skip chunks that are too short to contain scholarship info
    if (chunk.trim().length < 100) continue;

    try {
      const parsed = await parseScholarshipWithAI(chunk, apiKey);

      // Skip if AI couldn't find a real scholarship
      if (!parsed.title || parsed.title === "Unknown" || (parsed.confidenceScore ?? 0) < 30) {
        continue;
      }

      parsed.sourceName = source.name;
      parsed.sourceUrl = source.url;

      const saved = await upsertScholarship(parsed);
      results.push(saved);
    } catch (err) {
      // Log per-chunk errors but continue ingesting other chunks
      console.error(`[ingest] chunk error from ${source.name}:`, err instanceof Error ? err.message : err);
    }
  }

  return results;
}
