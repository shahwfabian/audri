"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function AppError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 // Log to server/monitoring only, never show raw error to user
 if (process.env.NODE_ENV === "development") {
 console.error("[AppError boundary]", error.digest ?? "no digest");
 }
 }, [error]);

 return (
 <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
 <div className="max-w-md w-full rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--surface-2)" }}>
 <AlertTriangle className="w-7 h-7" style={{ color: "var(--red)" }} />
 </div>
 <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Something went wrong</h1>
 <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-2)" }}>
 Audri ran into an unexpected issue. Your saved work should still be available after you reload.
 </p>
 <div className="flex gap-3 justify-center">
 <button
 onClick={reset}
 className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm"
 >
 <RefreshCw className="w-4 h-4" />
 Try again
 </button>
 <Link
 href="/generate"
 className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm"
 >
 <Home className="w-4 h-4" />
 Essay generator
 </Link>
 </div>
 </div>
 </div>
 );
}
