import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://audriai.vercel.app"),
 title: "Audri | Scholarship Research and Essay Writing",
 description:
 "Audri researches scholarship funders and helps students draft accurate essays from their real experiences.",
 keywords: ["scholarships", "AI", "college", "financial aid", "essays", "students"],
 openGraph: {
  title: "Audri | Scholarship Research and Essay Writing",
  description: "Research scholarship funders and build accurate essays from your real experiences.",
  type: "website",
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${geistSans.variable} ${geistMono.variable} h-full`}
 suppressHydrationWarning
 >
 <body className="min-h-full antialiased">
 {children}
 <Toaster
 position="top-right"
 richColors
 toastOptions={{ style: { fontFamily: "var(--font-geist-sans)" } }}
 />
 </body>
 </html>
 );
}
