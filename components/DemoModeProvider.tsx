"use client";

import { DEMO_MODE, installDemoFetch } from "@/lib/demo-mode";

installDemoFetch();

export default function DemoModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {DEMO_MODE && (
        <div className="fixed bottom-4 right-4 z-[100] rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-lg">
          Demo mode · local data
        </div>
      )}
    </>
  );
}
