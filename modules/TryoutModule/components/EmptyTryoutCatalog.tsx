import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export function EmptyTryoutCatalog() {
  return (
    <div className="p-10 rounded-lg border border-dashed border-border bg-surface-muted text-center space-y-3">
      <Calendar className="w-10 h-10 text-primary mx-auto stroke-[1.5]" />
      <h3 className="text-base font-bold text-text">Belum ada tryout yang dibuka</h3>
      <p className="text-sm text-text-muted max-w-md mx-auto">
        Jadwal Tryout Akbar SNBT berikutnya akan segera diumumkan. Kamu bisa berlatih ribuan soal di menu Latihan.
      </p>
      <div className="pt-2">
        <Link
          href="/latihan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
        >
          Mulai Latihan Soal
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
