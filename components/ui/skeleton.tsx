import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Skeleton
 * static blue-100 blocks with slow opacity pulse. No gradient shimmer. 0 radius.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-blue-100 animate-pulse rounded-none border border-slate-300",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
