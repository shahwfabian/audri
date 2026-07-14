import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://audriai.vercel.app";
 return ["", "/privacy", "/terms", "/login", "/signup"].map((path) => ({
  url: `${baseUrl}${path}`,
  lastModified: new Date(),
  changeFrequency: path ? "monthly" as const : "weekly" as const,
  priority: path ? 0.5 : 1,
 }));
}
