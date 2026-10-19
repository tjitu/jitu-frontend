"use client";

import React, { useEffect, useState } from "react";
import {
  Home,
  ShoppingBag,
  NotebookPen,
  Flame,
  LogOut,
  User,
  Ticket,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { BACKEND_URL } from "@/lib/api";
import { PixelCoin } from "@/components/ui/pixel-coin";
import BottomNav from "./BottomNav";

/**
 * DESIGN.md Section 6.3 — Student dashboard & app shell
 * - App header: "jitu." logo left; quota balance (mono chip) and avatar right.
 * - Phones: bottom tab bar (Beranda, Tryout, Coin, Akun), 56px tall.
 */
const navItems = [
  {
    title: "Beranda",
    path: "dashboard",
    icon: Home,
  },
  {
    title: "Tryout",
    path: "tryout",
    icon: NotebookPen,
  },
  {
    title: "Latihan",
    path: "daily-streak",
    icon: Flame,
  },
  {
    title: "Beli coin",
    path: "shop",
    icon: ShoppingBag,
  },
];

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadBalance = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/dashboard`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted && typeof data?.tokenBalance === "number") {
            setTokenBalance(data.tokenBalance);
          }
        }
      } catch {
        // Ignore network errors in header chip
      }
    };
    if (session) {
      loadBalance();
    }
    return () => {
      mounted = false;
    };
  }, [session, path]);

  const hidden = ["/login", "/register", "/admin"];
  const isExamPage = path.includes("/exam/") || path.includes("/break/");

  if (hidden.includes(path) || isExamPage) {
    return null;
  }

  const bottomNavItems = [
    { title: "Beranda", path: "dashboard", icon: Home },
    { title: "Tryout", path: "tryout", icon: NotebookPen },
    { title: "Latihan", path: "daily-streak", icon: Flame },
    { title: "Coin", path: "shop", icon: ShoppingBag },
    { title: "Akun", path: "profile", icon: User },
  ];

  const initial =
    session?.user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <>
      {/* Top App Header (Crisp modern header) */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              aria-label="Beranda Jitu"
              className="min-h-[44px] inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Image
                src="/blue-jitu-logo.png"
                alt="Logo Jitu"
                width={48}
                height={32}
                priority
                className="h-8 w-auto object-contain"
              />
              <span className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-blue-900 leading-none">
                jitu<span className="text-blue-600">.</span>
              </span>
            </Link>

            <nav
              aria-label="Navigasi aplikasi"
              className="hidden md:flex items-center gap-1"
            >
              {navItems.map((item) => {
                const isActive =
                  path === `/${item.path}` || path.startsWith(`/${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    href={`/${item.path}`}
                    className={`min-h-[38px] px-3.5 inline-flex items-center gap-2 text-[14px] transition-colors ${
                      isActive
                        ? "text-blue-700 bg-blue-50/80 font-semibold border-b-2 border-blue-600"
                        : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Coin Balance (Mono Chip) + Profile Avatar + Logout */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/shop"
              className="min-h-[36px] px-3 py-1 border border-amber-300 bg-amber-50 text-amber-900 font-mono text-[11px] uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 shadow-xs hover:bg-amber-100 transition-colors"
            >
              <PixelCoin size={15} />
              <span className="tabular-nums">
                {tokenBalance !== null ? `${tokenBalance} coin` : "Coin"}
              </span>
            </Link>

            <Link
              href="/profile"
              aria-label="Akun dan profil"
              className={`min-h-[36px] px-3 border inline-flex items-center gap-2 transition-colors text-[13px] font-medium shadow-xs ${
                path.startsWith("/profile")
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span className="w-5 h-5 border border-slate-300 inline-flex items-center justify-center font-mono text-[11px] font-semibold bg-slate-100 text-slate-700">
                {initial}
              </span>
              <span className="hidden sm:inline max-w-[110px] truncate">
                {session?.user?.name?.split(" ")[0] || "Akun"}
              </span>
            </Link>

            <button
              type="button"
              aria-label="Keluar akun"
              onClick={async () => {
                await signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/login"),
                  },
                });
              }}
              className="hidden sm:inline-flex min-h-[36px] min-w-[36px] items-center justify-center border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
              title="Keluar"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (DESIGN.md Section 6.3: 56px tall) */}
      <BottomNav items={bottomNavItems} className="md:hidden" />
    </>
  );
};

export default Navbar;
