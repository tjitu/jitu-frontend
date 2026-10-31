import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import DemoModeProvider from "@/components/DemoModeProvider";
import PageVisitTracker from "@/components/PageVisitTracker";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Jitu · Tryout SNBT Gratis, Pembahasan Mulai Rp8.900",
  description:
    "Tryout SNBT tiap minggu mulai 2 Nov 2026. Gratis dikerjakan, pembahasan dan skor IRT mulai Rp8.900 per tryout.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/blue-jitu-logo.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
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
