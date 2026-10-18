import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Textarea
 * white, 2px ink border, 0 radius, focus 3px blue-500 outline, 2px offset.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-none border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 aria-invalid:border-red-500 shadow-sm transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
