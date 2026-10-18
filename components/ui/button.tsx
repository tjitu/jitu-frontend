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
  "inline-flex items-center justify-center cursor-pointer gap-2 rounded-none border whitespace-nowrap text-[14px] font-medium transition-colors duration-150 ease-out disabled:pointer-events-none disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm",
        primary:
          "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm",
        signal:
          "bg-amber-400 text-blue-950 font-semibold border-amber-400 hover:bg-amber-300 active:bg-amber-500 shadow-sm",
        secondary:
          "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100/80 active:bg-blue-200 shadow-sm",
        destructive:
          "bg-red-600 text-white border-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm",
        outline:
          "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-sm",
        ghost:
          "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link: "border-transparent bg-transparent text-blue-600 underline-offset-4 hover:underline p-0 min-h-0 h-auto",
      },
      size: {
        default: "min-h-[42px] px-4 py-2",
        sm: "min-h-[36px] px-3 py-1 text-[13px]",
        lg: "min-h-[48px] px-6 py-2.5 text-[15px]",
        icon: "min-h-[40px] min-w-[40px] p-2",
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
