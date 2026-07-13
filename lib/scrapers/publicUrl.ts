import { lookup } from "dns/promises";
import type { LookupAddress } from "dns";
import { isIP } from "net";

export class UnsafeUrlError extends Error {}

function isPrivateIPv4(address: string): boolean {
 const octets = address.split(".").map(Number);
 if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
 return true;
 }
 const [a, b] = octets;
 return (
 a === 0 ||
 a === 10 ||
 a === 127 ||
 (a === 100 && b >= 64 && b <= 127) ||
 (a === 169 && b === 254) ||
 (a === 172 && b >= 16 && b <= 31) ||
 (a === 192 && b === 0) ||
 (a === 192 && b === 168) ||
 (a === 198 && (b === 18 || b === 19)) ||
 a >= 224
 );
}

export function isPrivateIPAddress(address: string): boolean {
 const family = isIP(address);
 if (family === 4) return isPrivateIPv4(address);
 if (family !== 6) return true;

 const normalized = address.toLowerCase().split("%")[0];
 if (normalized === "::" || normalized === "::1") return true;
 if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
 if (/^fe[89ab]/.test(normalized)) return true;
 if (normalized.startsWith("ff")) return true;

 const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
 return mapped ? isPrivateIPv4(mapped[1]) : false;
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
 let parsed: URL;
 try {
 parsed = new URL(rawUrl);
 } catch {
 throw new UnsafeUrlError("Enter a valid public scholarship URL.");
 }

 if (!['http:', 'https:'].includes(parsed.protocol)) {
 throw new UnsafeUrlError("Only public HTTP and HTTPS URLs are allowed.");
 }
 if (parsed.username || parsed.password) {
 throw new UnsafeUrlError("URLs containing credentials are not allowed.");
 }

 const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
 if (
 !hostname.includes(".") ||
 hostname === "localhost" ||
 hostname.endsWith(".localhost") ||
 hostname.endsWith(".local") ||
 hostname.endsWith(".internal")
 ) {
 throw new UnsafeUrlError("Private or local network URLs are not allowed.");
 }

 if (isIP(hostname)) {
 if (isPrivateIPAddress(hostname)) {
 throw new UnsafeUrlError("Private or local network URLs are not allowed.");
 }
 return parsed;
 }

 let addresses: LookupAddress[];
 try {
 addresses = (await lookup(hostname, { all: true, verbatim: true })) as LookupAddress[];
 } catch {
 throw new UnsafeUrlError("That scholarship website could not be resolved.");
 }
 if (!addresses.length || addresses.some((entry) => isPrivateIPAddress(entry.address))) {
 throw new UnsafeUrlError("Private or local network URLs are not allowed.");
 }

 return parsed;
}
