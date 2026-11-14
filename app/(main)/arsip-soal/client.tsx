"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import SoalAsliSection from "@/components/soal-asli-section";

export default function ArsipSoalClient() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/login?callbackUrl=/arsip-soal");
      } else if (searchParams.get("from") === "landing") {
        router.replace("/arsip-soal");
      }
    }
  }, [session, isPending, router, searchParams]);

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
          MEMUAT ARSIP SOAL...
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6">
      <SoalAsliSection variant="dashboard" />
    </div>
  );
}
