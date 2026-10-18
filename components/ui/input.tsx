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
        "w-full h-11 px-3.5 py-2 bg-white text-slate-900 border border-slate-300 rounded-none text-[15px] placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed aria-invalid:border-red-500 shadow-sm transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Input };
