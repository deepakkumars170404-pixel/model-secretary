import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import FloatingChat from "@/components/FloatingChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Model Secretary",
  description: "Personal AI Assistant & Trainer",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Model Secretary",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black text-black dark:text-white">
        <div className="flex-1 overflow-y-auto pb-16">
          {children}
        </div>
        
        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 w-full h-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-start gap-4 z-50 px-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </Link>
          <Link href="/diet" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">🍎</span>
            <span>Diet</span>
          </Link>
          <Link href="/wardrobe" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">👕</span>
            <span>Wardrobe</span>
          </Link>
          <Link href="/workout" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">💪</span>
            <span>Workout</span>
          </Link>
          <Link href="/timeline" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">📸</span>
            <span>Timeline</span>
          </Link>
          <Link href="/grooming" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">🧴</span>
            <span>Grooming</span>
          </Link>
          <Link href="/timetable" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">📅</span>
            <span>Routine</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center min-w-[48px] h-full text-[10px] hover:text-blue-500">
            <span className="text-lg">👤</span>
            <span>Profile</span>
          </Link>
        </nav>
        <FloatingChat />
      </body>
    </html>
  );
}
