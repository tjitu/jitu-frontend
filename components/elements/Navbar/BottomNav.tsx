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
        "fixed bottom-0 left-0 right-0 z-10 bg-surface border-t border-border md:hidden",
        className
      )}
    >
      <div className="grid grid-cols-5 h-14 p-1 gap-1">
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
                "flex flex-col items-center justify-center w-full h-full gap-1 rounded-sm transition-colors duration-[120ms] cursor-pointer",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "bg-surface text-text-muted hover:bg-surface-muted hover:text-text"
              )}
            >
              <item.icon className="h-4 w-4 stroke-[1.75]" aria-hidden="true" />
              <span className="text-[11px] font-medium tracking-tight truncate max-w-full px-1">
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
