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
import BottomNav from "./BottomNav";

/**
 * DESIGN.md Section 6.3 — Student dashboard & app shell
 * - App header: "jitu." logo left; quota balance (mono chip) and avatar right.
 * - Phones: bottom tab bar (Beranda, Tryout, Riwayat/Kuota, Akun), 56px tall.
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
    title: "Beli kuota",
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
    { title: "Kuota", path: "shop", icon: ShoppingBag },
    { title: "Akun", path: "profile", icon: User },
  ];

  const initial =
    session?.user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <>
      {/* Top App Header (DESIGN.md Section 6.3) */}
      <header className="sticky top-0 z-10 bg-white border-b-2 border-blue-900">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              aria-label="Beranda Jitu"
              className="min-h-[44px] inline-flex items-center gap-2 focus:outline-3 focus:outline-blue-500 focus:outline-offset-2"
            >
              <Image
                src="/blue-jitu-logo.png"
                alt="Logo Jitu"
                width={48}
                height={32}
                priority
                className="h-8 w-auto object-contain"
              />
              <span className="font-display font-extrabold text-[24px] tracking-[-0.025em] text-blue-900 leading-none">
                jitu<span className="text-blue-500">.</span>
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
                    className={`min-h-[44px] px-3.5 inline-flex items-center gap-2 text-[15px] font-semibold transition-colors ${
                      isActive
                        ? "text-blue-900 bg-blue-50 border-b-[3px] border-b-blue-500"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Quota Balance (Mono Chip) + Profile Avatar + Logout */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/shop"
              className="min-h-[38px] px-3 py-1 border-[1.5px] border-blue-900 bg-signal text-blue-900 font-mono text-[12px] uppercase tracking-[0.06em] font-medium inline-flex items-center gap-1.5 shadow-[2px_2px_0_var(--blue-900)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
              <span className="tabular-nums">
                {tokenBalance !== null ? `${tokenBalance} kuota` : "Kuota"}
              </span>
            </Link>

            <Link
              href="/profile"
              aria-label="Akun dan profil"
              className={`min-h-[40px] px-2.5 border-2 border-blue-900 inline-flex items-center gap-2 transition-colors ${
                path.startsWith("/profile")
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-900 hover:bg-blue-50"
              }`}
            >
              <span className="w-6 h-6 rounded-full border border-current inline-flex items-center justify-center font-mono text-[12px] font-medium">
                {initial}
              </span>
              <span className="hidden sm:inline text-[14px] font-semibold max-w-[110px] truncate">
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
              className="hidden sm:inline-flex min-h-[40px] min-w-[40px] items-center justify-center border-2 border-blue-900 bg-white text-warn hover:bg-warn-100 transition-colors cursor-pointer"
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
