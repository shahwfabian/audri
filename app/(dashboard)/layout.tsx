"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
 LayoutDashboard,
 User,
 BookOpen,
 FileText,
 Search,
 BarChart3,
 Sparkles,
 LogOut,
 Menu,
 X,
 ClipboardList,
 Zap,
 ChevronRight,
 Settings,
 Key,
 Mail,
 BookMarked,
 Quote,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AudriLogo } from "@/components/AudriLogo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
 { href: "/generate", icon: Sparkles, label: "Essay Generator", flagship: true },
 { href: "/manual", icon: BookMarked, label: "The Manual" },
 { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
 { href: "/profile", icon: User, label: "My Profile" },
 { href: "/scholarships/search",icon: Search, label: "Find Scholarships" },
 { href: "/scholarships/paste", icon: BarChart3, label: "Paste & Analyze" },
 { href: "/story-studio", icon: Quote, label: "Story Studio" },
 { href: "/stories", icon: BookOpen, label: "Story Vault" },
 { href: "/essays", icon: FileText, label: "Essays" },
 { href: "/recommendations", icon: Mail, label: "Rec Letters" },
 { href: "/gap-analysis", icon: Zap, label: "Gap Analysis" },
 { href: "/resume", icon: ClipboardList, label: "Resume Builder" },
 { href: "/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const router = useRouter();
 const pathname = usePathname();
 const { isLoggedIn, user, logout, sidebarOpen, setSidebarOpen, profile, onboardingComplete, apiKey, _hasHydrated } =
 useAppStore();
 const [serverHasKey, setServerHasKey] = useState(true); // optimistic, avoids badge flash

 useEffect(() => {
 if (!_hasHydrated) return;
 if (!isLoggedIn) router.push("/login");
 }, [isLoggedIn, _hasHydrated, router]);

 useEffect(() => {
 fetch("/api/ai/has-key")
 .then((r) => r.json())
 .then((d) => setServerHasKey(!!d.hasKey))
 .catch(() => setServerHasKey(false));
 }, []);

 if (!_hasHydrated) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
 <div className="flex items-center gap-3" style={{ color: "var(--text-2)" }}>
 <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border-2)", borderTopColor: "var(--gold)" }} />
 <span className="text-sm">Loading Audri…</span>
 </div>
 </div>
 );
 }

 if (!isLoggedIn) return null;

 function handleLogout() {
 logout();
 toast.success("Signed out successfully.");
 router.push("/");
 }

 const profileStrength = profile?.profileStrength ?? 0;

 return (
 <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
 {/* Sidebar */}
 <aside
 className={cn(
 "flex flex-col shrink-0 transition-all duration-200",
 sidebarOpen ? "w-64" : "w-16"
 )}
 style={{ background: "#080808", borderRight: "1px solid var(--border)" }}
 >
 {/* Logo */}
 <div className="h-16 flex items-center px-4" style={{ borderBottom: "1px solid var(--border)" }}>
 {sidebarOpen ? (
 <div className="flex items-center justify-between w-full">
 <Link href="/generate" className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)", border: "1px solid var(--gold-25)", boxShadow: "0 0 16px var(--gold-25)" }}>
 <AudriLogo size={22} />
 </div>
 <span className="font-bold text-lg text-gradient">Audri</span>
 </Link>
 <button onClick={() => setSidebarOpen(false)} className="transition-colors" style={{ color: "var(--text-3)" }}
 onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
 onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <button
 onClick={() => setSidebarOpen(true)}
 className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
 style={{ background: "var(--surface-2)", border: "1px solid var(--gold-25)", boxShadow: "0 0 16px var(--gold-25)" }}
 >
 <AudriLogo size={22} />
 </button>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
 {navItems.map((item) => {
 const active = pathname === item.href || pathname.startsWith(item.href + "/");
 return (
 <Link
 key={item.href}
 href={item.href}
 title={!sidebarOpen ? item.label : undefined}
 className={cn(
 "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
 !sidebarOpen && "justify-center"
 )}
 style={{
 background: active ? "var(--gold-10)" : item.flagship ? "rgba(255, 255, 255,0.05)" : "transparent",
 color: active || item.flagship ? "var(--gold-light)" : "var(--text-2)",
 borderLeft: active && sidebarOpen ? "2px solid var(--gold)" : "2px solid transparent",
 boxShadow: item.flagship && !active ? "inset 0 0 0 1px var(--gold-25)" : undefined,
 }}
 onMouseEnter={e => {
 if (!active) {
 (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
 (e.currentTarget as HTMLElement).style.color = "var(--text)";
 }
 }}
 onMouseLeave={e => {
 if (!active) {
 (e.currentTarget as HTMLElement).style.background = item.flagship ? "rgba(255, 255, 255,0.05)" : "transparent";
 (e.currentTarget as HTMLElement).style.color = item.flagship ? "var(--gold-light)" : "var(--text-2)";
 }
 }}
 >
 <item.icon className="w-4 h-4 shrink-0" />
 {sidebarOpen && <span>{item.label}</span>}
 {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto" style={{ color: "var(--gold-dark)" }} />}
 </Link>
 );
 })}
 </nav>

 {/* Profile strength + user */}
 <div className="p-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
 {sidebarOpen && (
 <div>
 <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-3)" }}>
 <span>Profile strength</span>
 <span className="font-semibold" style={{ color: "var(--gold)" }}>{profileStrength}%</span>
 </div>
 <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-2)" }}>
 <div
 className="h-full rounded-full transition-all duration-700"
 style={{ width: `${profileStrength}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold-light))" }}
 />
 </div>
 </div>
 )}

 <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
 <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
 <span className="text-xs font-bold" style={{ color: "#080808" }}>
 {user?.name?.[0]?.toUpperCase() ?? "?"}
 </span>
 </div>
 {sidebarOpen && (
 <>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name}</div>
 <div className="text-xs truncate" style={{ color: "var(--text-3)" }}>{user?.email}</div>
 </div>
 <button
 onClick={handleLogout}
 title="Sign out"
 className="transition-colors"
 style={{ color: "var(--text-3)" }}
 onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
 onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
 >
 <LogOut className="w-4 h-4" />
 </button>
 </>
 )}
 </div>
 </div>
 </aside>

 {/* Main */}
 <main className="flex-1 overflow-y-auto">
 {/* Top bar */}
 <div className="h-16 flex items-center px-6 sticky top-0 z-30" style={{ background: "rgba(8,8,8,0.90)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(8px)" }}>
 {!sidebarOpen && (
 <button onClick={() => setSidebarOpen(true)} className="mr-4 transition-colors" style={{ color: "var(--text-2)" }}
 onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
 onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
 >
 <Menu className="w-5 h-5" />
 </button>
 )}
 <div className="flex-1" />
 <div className="flex items-center gap-3">
 {!apiKey && !serverHasKey && (
 <Link
 href="/settings"
 className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 badge-red"
 >
 <Key className="w-3 h-3" />
 Add API key to enable AI
 </Link>
 )}
 {!onboardingComplete && (
 <Link
 href="/onboarding"
 className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors badge-gray"
 >
 Complete onboarding →
 </Link>
 )}
 <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center" style={{ boxShadow: "0 0 12px var(--gold-15)" }}>
 <span className="text-xs font-bold" style={{ color: "#080808" }}>
 {user?.name?.[0]?.toUpperCase() ?? "?"}
 </span>
 </div>
 </div>
 </div>

 {/* Page content */}
 <div className="p-6">{children}</div>
 </main>
 </div>
 );
}
