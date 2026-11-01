import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Input
 * White, 1px solid --border, radius 10 (rounded-md), 44px tall, 12px horizontal padding.
 * Hover border ink-300. Focus border --primary + 0 0 0 3px var(--blue-200).
 * Error border --danger with 12px helper below.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full h-11 px-3 py-2 bg-surface text-text border border-border rounded-md text-[15px] placeholder:text-text-muted hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed aria-invalid:border-danger aria-invalid:focus:ring-danger-soft transition-colors duration-[120ms]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
