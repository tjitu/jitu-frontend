import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * DESIGN.md Section 5 — Banner / Alert
 * signal-100 for info/warning, warn-100 for error, icon on the left, no thick left border, 0 radius.
 */
const alertVariants = cva(
  "relative w-full rounded-none border border-slate-200 px-4 py-3 text-[14px] grid has-[>svg]:grid-cols-[20px_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current shadow-xs",
  {
    variants: {
      variant: {
        default: "bg-blue-50/80 text-blue-950 border-blue-200",
        destructive:
          "bg-red-50/80 text-red-950 border-red-300 *:data-[slot=alert-description]:text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-bold tracking-tight text-blue-900",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-blue-900 col-start-2 grid justify-items-start gap-1 text-[14px] [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
