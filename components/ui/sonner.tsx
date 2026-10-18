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
 * bottom-left, 2px ink border, icon + text, dismisses after 5s (errors stay).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-left"
      duration={5000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-none border border-slate-200 bg-white text-slate-900 shadow-md font-sans text-[14px] font-medium px-4 py-3 flex items-center gap-2.5",
          title: "font-semibold text-slate-900",
          description: "text-slate-600 text-[13px]",
          error: "bg-red-50 text-red-900 border-red-200",
          warning: "bg-amber-50 text-amber-900 border-amber-200",
          success: "bg-white text-slate-900 border-slate-200",
        },
      }}
      icons={{
        success: <Check className="size-4 stroke-[1.75] text-emerald-600" />,
        info: <Info className="size-4 stroke-[1.75] text-blue-600" />,
        warning: <AlertTriangle className="size-4 stroke-[1.75] text-amber-600" />,
        error: <X className="size-4 stroke-[1.75] text-red-600" />,
        loading: <Loader2 className="size-4 stroke-[1.75] animate-spin text-blue-600" />,
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#0F172A",
          "--normal-border": "#E2E8F0",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
