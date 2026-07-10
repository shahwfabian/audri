// lib/scholarships/fetchSourceText.ts

export async function fetchSourceText(url: string): Promise<string> {
 const response = await fetch(url, {
 headers: {
 "User-Agent":
 "AudriScholarshipBot/1.0 (+https://audri.app; contact=support@audri.app)",
 Accept: "text/html,application/xhtml+xml",
 "Accept-Language": "en-US,en;q=0.9",
 },
 next: { revalidate: 0 },
 });

 if (!response.ok) {
 throw new Error(`HTTP ${response.status} fetching ${url}`);
 }

 const html = await response.text();

 // Strip scripts, styles, and tags, leave readable text
 return html
 .replace(/<script[\s\S]*?<\/script>/gi, "")
 .replace(/<style[\s\S]*?<\/style>/gi, "")
 .replace(/<nav[\s\S]*?<\/nav>/gi, "")
 .replace(/<header[\s\S]*?<\/header>/gi, "")
 .replace(/<footer[\s\S]*?<\/footer>/gi, "")
 .replace(/<[^>]*>/g, " ")
 .replace(/&amp;/g, "&")
 .replace(/&lt;/g, "<")
 .replace(/&gt;/g, ">")
 .replace(/&nbsp;/g, " ")
 .replace(/\s+/g, " ")
 .trim()
 .slice(0, 12000); // Cap at 12k chars to stay within AI context limits
}
