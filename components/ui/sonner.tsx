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
            "rounded-none border-2 border-blue-900 bg-white text-blue-900 shadow-[4px_4px_0_var(--blue-900)] font-sans text-[14px] font-medium px-4 py-3 flex items-center gap-2.5",
          title: "font-semibold text-blue-900",
          description: "text-slate-700 text-[13px]",
          error: "bg-warn-100 text-warn border-warn",
          warning: "bg-signal-100 text-signal-700 border-blue-900",
          success: "bg-white text-blue-900 border-blue-900",
        },
      }}
      icons={{
        success: <Check className="size-4 stroke-[1.75] text-blue-600" />,
        info: <Info className="size-4 stroke-[1.75] text-blue-500" />,
        warning: <AlertTriangle className="size-4 stroke-[1.75] text-signal-700" />,
        error: <X className="size-4 stroke-[1.75] text-warn" />,
        loading: <Loader2 className="size-4 stroke-[1.75] animate-spin text-blue-500" />,
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#0B1B3F",
          "--normal-border": "#0B1B3F",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
