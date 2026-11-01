"use client";

import { DEMO_MODE, installDemoFetch } from "@/lib/demo-mode";

installDemoFetch();

export default function DemoModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {DEMO_MODE && (
        <div className="fixed bottom-16 md:bottom-4 right-4 z-40 h-6 inline-flex items-center rounded-full border border-yellow-300 bg-yellow-100 px-2.5 text-[12px] font-semibold text-yellow-700">
          Mode demo · data lokal
        </div>
      )}
    </>
  );
}
