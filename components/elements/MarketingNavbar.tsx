"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Harga", href: "/pricing" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "FAQ", href: "/#faq" },
];

export default function MarketingNavbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-white/50 backdrop-blur-sm py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <button
          type="button"
          className="flex h-10 w-[118px] items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/images/jitu-logo-light.png"
            alt="Logo Jitu"
            width={5672}
            height={2279}
            priority
            className="h-10 w-auto object-contain"
          />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-sm"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-gray-700 hover:text-blue-600 font-medium hidden sm:flex"
              >
                Masuk
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
              >
                Daftar Gratis
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
