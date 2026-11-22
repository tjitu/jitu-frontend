import { Check } from "lucide-react";
import { getSubtestMeta } from "@/lib/soal-asli-types";
import { getSubtestInfo } from "@/modules/TryoutDetailModule/components/subtest-meta";
import type { CategoryDetail } from "@/modules/TryoutDetailModule/interface";

export function BreakProgress({ subtests, nextIndex }: { subtests: CategoryDetail[]; nextIndex: number }) {
  return (
    <aside aria-labelledby="progress-heading" className="border-t border-border bg-surface-muted p-6 sm:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
      <h2 id="progress-heading" className="font-display text-lg font-bold text-text">Progres tryout</h2>
      <p className="mt-1 text-sm text-text-body">{nextIndex} dari {subtests.length} subtes selesai</p>
      <ol className="mt-5 space-y-1">
        {subtests.map((subtest, index) => {
          const done = index < nextIndex;
          const next = index === nextIndex;
          return (
            <li key={subtest.id} aria-current={next ? "step" : undefined}
              className="flex items-start gap-3 px-3 py-2.5">
              <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${done ? "bg-success-soft text-success-text" : next ? "bg-primary text-on-primary" : "border border-border text-text-muted"}`}>
                {done || next ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0">
                <span className={`block break-words text-sm leading-6 ${next ? "font-bold text-text" : "text-text-muted"}`}>
                  {getSubtestMeta(subtest.name).label} ({getSubtestInfo(subtest.name, index).code})
                </span>
                <span className="sr-only">{done ? "Selesai" : next ? "Berikutnya" : "Belum dimulai"}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
