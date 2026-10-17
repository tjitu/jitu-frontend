"use client";

import { DEMO_MODE, installDemoFetch } from "@/lib/demo-mode";

installDemoFetch();

export default function DemoModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {DEMO_MODE && (
        <div className="fixed bottom-16 md:bottom-4 right-4 z-40 rounded-none border-[1.5px] border-blue-900 bg-signal-100 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-signal-700 shadow-[2px_2px_0_var(--blue-900)]">
          Mode demo · data lokal
        </div>
      )}
    </>
  );
}
