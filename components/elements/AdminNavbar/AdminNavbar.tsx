"use client";

import React, { useState } from "react";
import {
  BanknoteIcon,
  BriefcaseIcon,
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
    title: "Paket coin",
    path: "/admin/packages",
    icon: CoinsIcon,
  },
  {
    title: "Soal harian",
    path: "/admin/daily",
    icon: CalendarDaysIcon,
  },
  {
    title: "Open Hiring 2026",
    path: "/admin/hiring",
    icon: BriefcaseIcon,
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
      {/* Phone Top Menu */}
      <header className="lg:hidden sticky top-0 z-10 bg-surface text-text border-b border-border">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2">
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={42}
              height={28}
              priority
              className="h-7 w-auto object-contain"
            />
            <span className="font-bold text-[22px] tracking-[-0.025em] text-text leading-none">
              jitu<span className="text-primary">.</span>
            </span>
            <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold inline-flex items-center">
              Admin
            </span>
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Tutup menu admin" : "Buka menu admin"}
            onClick={() => setMobileOpen((v) => !v)}
            className="min-h-[40px] min-w-[40px] rounded-md border border-border bg-surface text-text inline-flex items-center justify-center hover:bg-surface-muted transition-colors"
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
            className="border-t border-border bg-surface px-4 py-3 space-y-1 shadow-float"
          >
            {items.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`min-h-[42px] px-3 rounded-md flex items-center gap-3 text-[14px] font-medium transition-colors duration-[120ms] ${
                    active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-text-body hover:bg-surface-muted hover:text-text"
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
              className="w-full min-h-[42px] px-3 rounded-md flex items-center gap-3 text-[14px] font-medium text-danger-text hover:bg-danger-soft cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </nav>
        )}
      </header>

      {/* Desktop Sidebar (DESIGN.md §2.1 & §5: surface-muted ink-50 sidebar, active item blue-50 + blue-700) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0 bg-surface-muted text-text border-r border-border min-h-screen sticky top-0 h-screen">
        {/* Top Brand Header */}
        <div className="h-16 px-5 border-b border-border bg-surface flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-2.5">
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={48}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-[22px] tracking-[-0.025em] text-text leading-none">
              jitu<span className="text-primary">.</span>
            </span>
          </Link>
          <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold inline-flex items-center">
            Admin
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
                className={`min-h-[40px] px-3.5 py-2 rounded-md flex items-center gap-3 text-[14px] transition-colors duration-[120ms] ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-text-body font-medium hover:bg-ink-100/70 hover:text-text"
                }`}
              >
                <item.icon className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Admin User Info & Logout */}
        <div className="p-4 border-t border-border bg-surface space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-text truncate">
                {session?.user?.name || "Admin"}
              </div>
              <div className="text-[12px] text-text-muted truncate">
                {session?.user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Keluar akun"
              title="Keluar"
              className="min-h-[38px] min-w-[38px] rounded-md border border-border bg-surface text-text-muted hover:text-danger-text hover:bg-danger-soft hover:border-danger/30 inline-flex items-center justify-center transition-colors duration-[120ms] cursor-pointer shrink-0"
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
