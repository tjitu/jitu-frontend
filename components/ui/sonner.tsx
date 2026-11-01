"use client";

import {
  Check,
  Info,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * DESIGN.md Section 5 — Toast
 * ink-900 bg, white text, radius 10 (rounded-md), bottom-center, 4s auto-dismiss.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      duration={4000}
      className="toaster group z-40"
      toastOptions={{
        classNames: {
          toast:
            "rounded-md border border-ink-700 bg-ink-900 text-white shadow-float font-sans text-[14px] font-medium px-4 py-3 flex items-center gap-2.5",
          title: "font-semibold text-white",
          description: "text-ink-200 text-[13px]",
          error: "bg-ink-900 text-white border-danger",
          warning: "bg-ink-900 text-white border-yellow-400",
          success: "bg-ink-900 text-white border-ink-700",
        },
      }}
      icons={{
        success: <Check className="size-4 stroke-[1.75] text-success" />,
        info: <Info className="size-4 stroke-[1.75] text-blue-400" />,
        warning: <AlertTriangle className="size-4 stroke-[1.75] text-yellow-400" />,
        error: <X className="size-4 stroke-[1.75] text-danger" />,
        loading: <Loader2 className="size-4 stroke-[1.75] animate-spin text-blue-400" />,
      }}
      style={
        {
          "--normal-bg": "#151B2B",
          "--normal-text": "#FFFFFF",
          "--normal-border": "#3A4458",
          "--border-radius": "10px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
