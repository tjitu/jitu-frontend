import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 & 7 — Skeleton
 * ink-100 blocks with 1.4s shimmer, radius 10 (rounded-md).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "jitu-skeleton rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
