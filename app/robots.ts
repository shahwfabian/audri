import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://audriai.vercel.app";
 return {
  rules: {
   userAgent: "*",
   allow: ["/", "/privacy", "/terms"],
   disallow: ["/api/", "/dashboard", "/generate", "/profile", "/settings"],
  },
  sitemap: `${baseUrl}/sitemap.xml`,
 };
}
