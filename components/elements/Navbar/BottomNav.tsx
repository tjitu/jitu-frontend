"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

/**
 * DESIGN.md Section 6.3 — Phones: bottom tab bar, 56px tall (h-14)
 */
const BottomNav = ({ items, className }: BottomNavProps) => {
  const path = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Navigasi bawah"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-blue-900 md:hidden",
        className
      )}
    >
      <div className="grid grid-cols-5 h-14 divide-x divide-slate-300">
        {items.slice(0, 5).map((item) => {
          const cleanPath = item.path.replace(/\/$/, "");
          const isActive =
            path === `/${cleanPath}` ||
            (cleanPath !== "admin" && path.startsWith(`/${cleanPath}/`));

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => router.push(`/${item.path}`)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors cursor-pointer",
                isActive
                  ? "bg-blue-50 text-blue-500 font-bold border-t-[3px] border-t-blue-500"
                  : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-900"
              )}
            >
              <item.icon className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] truncate max-w-full px-1">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
