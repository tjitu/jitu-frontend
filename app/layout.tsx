import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import DemoModeProvider from "@/components/DemoModeProvider";
import PageVisitTracker from "@/components/PageVisitTracker";
import "./globals.css";

const plusJakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.ttf",
  weight: "200 800",
  display: "swap",
  variable: "--font-jakarta",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.ttf",
  weight: "100 800",
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Jitu · Tryout SNBT Gratis, Pembahasan Mulai Rp8.900",
  description:
    "Tryout SNBT tiap minggu mulai 16 Nov 2026. Gratis dikerjakan, pembahasan dan skor IRT mulai Rp8.900 per tryout.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/blue-jitu-logo.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  // Proves ownership of jituptn.com to Google Search Console (needed for OAuth brand verification).
  verification: {
    google: "LL4IErne72W99g1iILyPYJ7xlJYzhV-QL3HieXdPG5g",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans bg-bg text-text-body">
        <PageVisitTracker />
        <DemoModeProvider>{children}</DemoModeProvider>
        <Analytics />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
