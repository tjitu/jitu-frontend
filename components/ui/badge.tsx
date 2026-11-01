import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Badge / Chip
 * 24px tall, radius full, 12px/600 text, soft status backgrounds.
 * Accent chip: yellow-100 bg, yellow-700 text.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center h-6 rounded-full border border-transparent px-2.5 text-[12px] font-semibold leading-[1.33] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-blue-50 text-blue-800",
        primary: "bg-primary text-on-primary",
        secondary: "bg-ink-50 text-ink-700 border-ink-200",
        signal: "bg-yellow-100 text-yellow-700",
        accent: "bg-yellow-100 text-yellow-700",
        success: "bg-success-soft text-success-text",
        warn: "bg-yellow-100 text-yellow-700",
        danger: "bg-danger-soft text-danger-text",
        destructive: "bg-danger-soft text-danger-text",
        outline: "bg-surface text-ink-700 border-border",
        chips: "bg-blue-50 text-blue-800",
      },
      size: {
        sm: "h-6 text-[12px] px-2.5",
        md: "h-6 text-[12px] px-2.5",
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
    blue: "bg-blue-50 text-blue-800",
    purple: "bg-blue-100 text-blue-800",
    green: "bg-success-soft text-success-text",
    orange: "bg-yellow-100 text-yellow-700",
    red: "bg-danger-soft text-danger-text",
    yellow: "bg-yellow-100 text-yellow-700",
    indigo: "bg-blue-600 text-white",
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
