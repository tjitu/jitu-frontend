import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Button
 * - Radius: 10px (rounded-md), 44px tall (48px for hero CTAs).
 * - Primary: --primary fill, white text. Hover --primary-hover, pressed --primary-pressed, disabled --blue-300.
 * - Secondary: white fill, 1px solid --border, --text. Hover --surface-muted.
 * - Ghost: transparent, --primary text, hover --blue-50.
 * - Accent (rare): --yellow-400 fill, --ink-900 text, 600 weight, hover --yellow-500.
 * - Destructive: --danger fill, white text.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 rounded-md border whitespace-nowrap text-[14px] font-semibold transition-colors duration-[120ms] ease-out disabled:pointer-events-none disabled:bg-ink-100 disabled:text-ink-500 disabled:border-ink-200 shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary border-transparent hover:bg-primary-hover active:bg-primary-pressed disabled:bg-blue-300 disabled:text-white disabled:border-transparent",
        primary:
          "bg-primary text-on-primary border-transparent hover:bg-primary-hover active:bg-primary-pressed disabled:bg-blue-300 disabled:text-white disabled:border-transparent",
        signal:
          "bg-yellow-400 text-ink-900 font-semibold border-transparent hover:bg-yellow-500 active:bg-yellow-700 active:text-white",
        accent:
          "bg-yellow-400 text-ink-900 font-semibold border-transparent hover:bg-yellow-500 active:bg-yellow-700 active:text-white",
        secondary:
          "bg-surface text-text border-border hover:bg-surface-muted active:bg-ink-100",
        destructive:
          "bg-danger text-white border-transparent hover:opacity-90 active:bg-danger-text",
        outline:
          "bg-surface text-text border-border hover:bg-surface-muted active:bg-ink-100",
        ghost:
          "border-transparent bg-transparent text-primary hover:bg-blue-50",
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline p-0 min-h-0 h-auto",
      },
      size: {
        default: "min-h-[44px] px-4 py-2.5",
        sm: "min-h-[36px] px-3 py-1.5 text-[13px]",
        lg: "min-h-[48px] px-6 py-3 text-[15px]",
        icon: "min-h-[44px] min-w-[44px] p-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
