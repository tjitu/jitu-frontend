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
  "inline-flex items-center justify-center rounded-none border-[1.5px] border-blue-900 px-2 py-[3px] font-mono text-[12px] uppercase tracking-[0.06em] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-900",
        primary: "bg-blue-500 text-white",
        secondary: "bg-blue-100 text-blue-900",
        signal: "bg-signal text-blue-900",
        success: "bg-emerald-50 text-[#15803D] border-[#15803D]",
        warn: "bg-amber-50 text-[#B45309] border-[#B45309]",
        danger: "bg-red-50 text-[#DC2626] border-[#DC2626]",
        destructive: "bg-red-50 text-[#DC2626] border-[#DC2626]",
        outline: "bg-white text-blue-900",
        chips: "bg-blue-100 text-blue-900",
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
