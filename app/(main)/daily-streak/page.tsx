import Link from "next/link";
import { Lock, ArrowLeft, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DailyStreakPage() {
  return (
    <div className="min-h-[70vh] max-w-[640px] mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-surface-muted border border-border flex items-center justify-center text-text-muted shadow-xs">
          <Flame className="w-10 h-10 text-slate-400 stroke-[1.5]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-md border-2 border-surface">
          <Lock className="w-4 h-4 stroke-[2.25]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
        <Lock className="w-3 h-3" />
        Halaman Dikunci · Segera Hadir
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight mb-3">
        Latihan Harian Sedang Dikunci
      </h1>

      <p className="text-sm sm:text-base text-text-muted max-w-[440px] leading-relaxed mb-8">
        Halaman latihan harian (Daily Streak) saat ini belum dapat dibuka dan sedang dalam pemeliharaan. Nantikan pembaruan segera!
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/dashboard">
          <Button variant="default" size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>
        <Link href="/tryout">
          <Button variant="outline" size="lg">
            Kerjakan Tryout
          </Button>
        </Link>
      </div>
    </div>
  );
}
