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
        "flex field-sizing-content min-h-24 w-full rounded-none border-2 border-blue-900 bg-white px-3.5 py-2.5 text-[16px] text-blue-900 placeholder:text-slate-500 focus:outline-3 focus:outline-blue-500 focus:outline-offset-2 disabled:cursor-not-allowed disabled:bg-blue-100 disabled:text-slate-500 aria-invalid:border-warn",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
