import Link from "next/link";
import type { ReactNode } from "react";
import { AudriLogo } from "@/components/AudriLogo";

export function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
 return (
  <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
   <header className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
    <Link href="/" className="flex items-center gap-2"><AudriLogo size={28} /><span className="font-semibold">Audri</span></Link>
    <Link href="/" className="text-sm" style={{ color: "var(--text-2)" }}>Return home</Link>
   </header>
   <article className="max-w-3xl mx-auto px-6 pb-20">
    <h1 className="text-4xl font-bold mb-2">{title}</h1>
    <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>Last updated July 13, 2026</p>
    <div className="space-y-8 text-sm leading-7 legal-copy" style={{ color: "var(--text-2)" }}>{children}</div>
   </article>
  </main>
 );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
 return <section><h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text)" }}>{title}</h2><div className="space-y-3">{children}</div></section>;
}

