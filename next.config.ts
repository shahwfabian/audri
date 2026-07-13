import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
 async headers() {
  return [{
   source: "/(.*)",
   headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: "base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://checkout.stripe.com" },
   ],
  }];
 },
};

export default withSentryConfig(nextConfig, {
 silent: true,
 sourcemaps: { deleteSourcemapsAfterUpload: true },
});
