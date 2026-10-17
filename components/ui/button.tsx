import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Button
 * min height 44px, padding 14×22, 2px ink border, 0 radius
 * - Primary (blue): blue-500 fill, white text, 2px ink border
 * - Signal (secondary / main CTA): signal fill, ink text, md shadow -> 2px hover -> 0 active + shift 4px
 * - Outline: white/transparent, 2px ink border
 * - Destructive: warn fill, white text, 2px ink border
 * - Disabled: blue-100 fill, slate-500 text, no shadow
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 rounded-none border-2 border-blue-900 whitespace-nowrap text-[14px] font-semibold transition-[transform,box-shadow,background-color,color] duration-120 ease-out disabled:pointer-events-none disabled:bg-blue-100 disabled:text-slate-500 disabled:border-slate-500 disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
        primary:
          "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
        signal:
          "bg-signal text-blue-900 font-bold shadow-[4px_4px_0_var(--blue-900)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--blue-900)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "bg-signal text-blue-900 font-bold shadow-[4px_4px_0_var(--blue-900)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--blue-900)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        destructive:
          "bg-warn text-white hover:opacity-95",
        outline:
          "bg-white text-blue-900 hover:bg-blue-100",
        ghost:
          "border-transparent bg-transparent text-blue-900 hover:bg-blue-100 hover:border-blue-900",
        link: "border-transparent bg-transparent text-blue-500 underline-offset-4 hover:underline p-0 min-h-0 h-auto",
      },
      size: {
        default: "min-h-[44px] px-[22px] py-[10px]",
        sm: "min-h-[38px] px-3.5 py-1.5 text-[12px]",
        lg: "min-h-[48px] px-6 py-3 text-[16px]",
        icon: "min-h-[44px] min-w-[44px] p-2",
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
