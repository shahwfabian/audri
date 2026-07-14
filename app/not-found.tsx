import Link from "next/link";
import { AudriLogo } from "@/components/AudriLogo";

export default function NotFound() {
 return (
  <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
   <section className="w-full max-w-md rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border-2)" }}>
    <AudriLogo size={42} className="mx-auto mb-6" />
    <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-3)" }}>404</p>
    <h1 className="text-2xl font-bold mb-3">This page could not be found</h1>
    <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>The address may be outdated. Return to Audri and continue your work.</p>
    <Link href="/" className="btn-gold inline-flex px-6 py-3 text-sm">Return home</Link>
   </section>
  </main>
 );
}
