"use client";

import { useEffect } from "react";

// Root-level error boundary, catches errors in the root layout itself.
export default function GlobalError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 if (process.env.NODE_ENV === "development") {
 console.error("[GlobalError]", error.digest);
 }
 }, [error]);

 return (
 <html lang="en">
 <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f8fafc" }}>
 <div
 style={{
 minHeight: "100vh",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: "24px",
 }}
 >
 <div
 style={{
 maxWidth: 400,
 background: "white",
 borderRadius: 16,
 border: "1px solid #e2e8f0",
 padding: 40,
 textAlign: "center",
 }}
 >
 <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
 <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
 Audri ran into a problem
 </h1>
 <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
 Something unexpected happened. Your data is safe. Please refresh the page.
 </p>
 <button
 onClick={reset}
 style={{
 background: "#2563eb",
 color: "white",
 border: "none",
 borderRadius: 12,
 padding: "10px 24px",
 fontSize: 14,
 fontWeight: 600,
 cursor: "pointer",
 }}
 >
 Refresh page
 </button>
 </div>
 </div>
 </body>
 </html>
 );
}
