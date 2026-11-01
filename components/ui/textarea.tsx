import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Textarea
 * White, 1px solid --border, radius 10 (rounded-md), 12px horizontal padding.
 * Hover border ink-300. Focus border --primary + 0 0 0 3px var(--blue-200).
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[15px] text-text placeholder:text-text-muted hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted aria-invalid:border-danger transition-colors duration-[120ms]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
