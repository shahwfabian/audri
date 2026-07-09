// lib/scholarships/normalizeScholarship.ts

export function normalizeScholarshipKey(title: string, organization?: string) {
  return `${title}-${organization || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
