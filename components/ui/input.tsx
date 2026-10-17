import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Input
 * white, 2px ink border, 48px tall, 0 radius.
 * Focus: 3px blue-500 outline, 2px offset.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full h-12 px-3.5 py-2 bg-white text-blue-900 border-2 border-blue-900 rounded-none text-[16px] placeholder:text-slate-500 focus:outline-3 focus:outline-blue-500 focus:outline-offset-2 disabled:bg-blue-100 disabled:text-slate-500 disabled:cursor-not-allowed aria-invalid:border-warn transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Input };
