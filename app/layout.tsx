import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import DemoModeProvider from "@/components/DemoModeProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-display",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Jitu · Tryout SNBT Gratis, Pembahasan Mulai Rp9.500",
  description:
    "Tryout SNBT tiap minggu mulai 2 Nov 2026. Gratis dikerjakan. Skor IRT dan pembahasan tiap soal dibuka pakai 1 kuota, mulai Rp9.500 per tryout.",
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
      className={`${bricolage.variable} ${figtree.variable} ${dmMono.variable}`}
    >
      <body className="antialiased font-sans bg-[#F3F6FC] text-[#0B1B3F]">
        <DemoModeProvider>{children}</DemoModeProvider>
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}

