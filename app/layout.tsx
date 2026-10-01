import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import DemoModeProvider from "@/components/DemoModeProvider";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "JituPTN",
  description: "Website Resmi JituPTN",
};
//dummy comment
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased`}>
        <DemoModeProvider>{children}</DemoModeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
