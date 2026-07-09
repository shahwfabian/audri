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
  title: "Audri — Your Scholarship Operating System",
  description:
    "One profile. Every scholarship. Every essay. Every opportunity. Audri is the AI-powered scholarship command center for students.",
  keywords: ["scholarships", "AI", "college", "financial aid", "essays", "students"],
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
