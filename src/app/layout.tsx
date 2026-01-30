import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendance & Engagement Tracker",
  description: "Track attendance, engagement, and insights for your class or team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <span className="text-sm font-semibold">AE</span>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Attendance &amp; Engagement
                  </p>
                  <p className="text-xs text-slate-400">
                    Classroom / Team Analytics Dashboard
                  </p>
                </div>
              </div>
              <nav className="hidden items-center gap-4 text-sm font-medium text-slate-300 sm:flex">
                <Link href="/" className="hover:text-white">
                  Dashboard
                </Link>
                <Link href="/members" className="hover:text-white">
                  Members
                </Link>
                <Link href="/sessions" className="hover:text-white">
                  Sessions
                </Link>
                <Link href="/check-in" className="hover:text-white">
                  Check-in
                </Link>
                <Link href="/reports" className="hover:text-white">
                  Reports
                </Link>
              </nav>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Link
                  href="/logout"
                  className="rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
                >
                  Log out
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-lg shadow-emerald-500/10 sm:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
