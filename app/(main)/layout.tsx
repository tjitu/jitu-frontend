"use client";

import Navbar from "@/components/elements/Navbar/Navbar";
import { usePathname } from "next/navigation";

const HIDDEN_NAVBAR_ROUTES = ["/"];

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isExamOrBreak =
    pathname.includes("/exam/") || pathname.includes("/break/");
  const hideNavbar =
    HIDDEN_NAVBAR_ROUTES.includes(pathname) || isExamOrBreak;

  return (
    <div className="min-h-screen w-full bg-blue-50 text-blue-900 flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className={`flex-1 w-full ${!hideNavbar ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>
    </div>
  );
}
