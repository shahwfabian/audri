"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
 useEffect(() => {
  Sentry.captureException(error);
 }, [error]);

 return (
  <html lang="en">
   <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#080808", color: "#f5f5f5" }}>
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
     <section style={{ maxWidth: 420, background: "#111", borderRadius: 16, border: "1px solid #333", padding: 40, textAlign: "center" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Audri ran into a problem</h1>
      <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6, marginBottom: 24 }}>Your saved work remains available. Try loading this page again.</p>
      <button onClick={reset} style={{ background: "#f5f5f5", color: "#080808", border: 0, borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try again</button>
     </section>
    </main>
   </body>
  </html>
 );
}
