"use client";

import React, { useState } from "react";
import {
  BanknoteIcon,
  CalendarDaysIcon,
  CoinsIcon,
  HomeIcon,
  NotebookPenIcon,
  Sparkles,
  UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

/**
 * DESIGN.md Section 6.7 — Admin Navigation
 * Blue-800 sidebar (desktop) or top menu (phone).
 */
const items = [
  {
    title: "Ringkasan",
    path: "/admin",
    icon: HomeIcon,
    exact: true,
  },
  {
    title: "Kelola tryout",
    path: "/admin/tryout",
    icon: NotebookPenIcon,
  },
  {
    title: "Generator soal AI",
    path: "/admin/ai-generator",
    icon: Sparkles,
  },
  {
    title: "Kelola siswa",
    path: "/admin/user",
    icon: UserIcon,
  },
  {
    title: "Pembayaran",
    path: "/admin/payments",
    icon: BanknoteIcon,
  },
  {
    title: "Paket kuota",
    path: "/admin/packages",
    icon: CoinsIcon,
  },
  {
    title: "Soal harian",
    path: "/admin/daily",
    icon: CalendarDaysIcon,
  },
];

const AdminNavbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const isItemActive = (item: (typeof items)[number]) => {
    if (item.exact) {
      return path === "/admin" || path === "/admin/";
    }
    return path === item.path || path.startsWith(`${item.path}/`);
  };

  return (
    <>
      {/* Phone Top Menu (DESIGN.md Section 6.7: Blue-800 top menu on phone) */}
      <header className="lg:hidden sticky top-0 z-20 bg-blue-800 text-white border-b-2 border-blue-900">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={42}
              height={28}
              priority
              className="h-7 w-auto object-contain"
            />
            <span className="font-display font-extrabold text-[22px] tracking-[-0.025em] text-white leading-none">
              jitu<span className="text-signal">.</span>
            </span>
            <span className="px-1.5 py-[1px] border border-slate-600 bg-blue-900 font-mono text-[11px] uppercase tracking-[0.06em] text-blue-200">
              ADMIN
            </span>
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu admin" : "Buka menu admin"}
            onClick={() => setMobileOpen((v) => !v)}
            className="min-h-[40px] min-w-[40px] border-2 border-slate-600 bg-blue-900 text-white inline-flex items-center justify-center"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <nav
            aria-label="Menu admin"
            className="border-t border-slate-600 bg-blue-800 px-4 py-3 space-y-1"
          >
            {items.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`min-h-[44px] px-3 flex items-center gap-3 text-[15px] font-semibold transition-colors ${
                    active
                      ? "bg-signal text-blue-900 border-2 border-blue-900"
                      : "text-blue-100 hover:bg-blue-900"
                  }`}
                >
                  <item.icon className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[44px] px-3 flex items-center gap-3 text-[15px] font-semibold text-warn-100 hover:bg-blue-900 cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </nav>
        )}
      </header>

      {/* Desktop Blue-800 Sidebar (DESIGN.md Section 6.7) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-blue-800 text-white border-r-2 border-blue-900 min-h-screen sticky top-0 h-screen">
        {/* Top Brand Header */}
        <div className="p-5 border-b border-slate-600 flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2.5">
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={48}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="font-display font-extrabold text-[24px] tracking-[-0.025em] text-white leading-none">
              jitu<span className="text-signal">.</span>
            </span>
          </Link>
          <span className="px-2 py-[2px] border border-slate-600 bg-blue-900 font-mono text-[11px] uppercase tracking-[0.06em] text-blue-200">
            ADMIN
          </span>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Navigasi admin" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`min-h-[44px] px-3.5 py-2.5 flex items-center gap-3 text-[14px] font-semibold transition-colors ${
                  active
                    ? "bg-signal text-blue-900 border-2 border-blue-900 font-bold"
                    : "text-blue-100 hover:bg-blue-900 border-2 border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Admin User Info & Logout */}
        <div className="p-4 border-t border-slate-600 bg-blue-900 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-white truncate">
                {session?.user?.name || "Admin"}
              </div>
              <div className="font-mono text-[11px] text-blue-300 truncate">
                {session?.user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Keluar akun"
              title="Keluar"
              className="min-h-[38px] min-w-[38px] border border-slate-600 bg-blue-800 text-white hover:bg-warn hover:border-warn inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminNavbar;
