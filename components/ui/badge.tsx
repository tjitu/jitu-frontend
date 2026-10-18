import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Chip / badge
 * 1.5px ink border, padding 3×8, mono 12px uppercase, 0 radius.
 * Free = signal, Locked = white + lock icon, Done = blue-100.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border px-2 py-[2px] font-mono text-[11px] uppercase tracking-[0.06em] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-blue-50 text-blue-700 border-blue-200",
        primary: "bg-blue-600 text-white border-blue-600",
        secondary: "bg-slate-100 text-slate-700 border-slate-200",
        signal: "bg-amber-50 text-amber-900 border-amber-300 font-semibold",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warn: "bg-amber-50 text-amber-800 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        destructive: "bg-red-50 text-red-700 border-red-200",
        outline: "bg-white text-slate-700 border-slate-300",
        chips: "bg-blue-50 text-blue-700 border-blue-200",
      },
      size: {
        sm: "text-[11px] px-2 py-[2px]",
        md: "text-[12px] px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    color?:
      | "blue"
      | "purple"
      | "green"
      | "orange"
      | "red"
      | "yellow"
      | "indigo";
  }) {
  const Comp = asChild ? Slot : "span";

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-900",
    purple: "bg-blue-200 text-blue-900",
    green: "bg-blue-600 text-white",
    orange: "bg-signal-100 text-signal-700",
    red: "bg-warn-100 text-warn",
    yellow: "bg-signal text-blue-900",
    indigo: "bg-blue-800 text-white",
  };

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        color ? colorMap[color] : undefined,
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
