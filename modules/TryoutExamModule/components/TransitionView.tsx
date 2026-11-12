import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Clock, FileText } from "lucide-react";

interface SubtestInfo {
  id: string;
  name: string;
  order: number;
  durationMinutes: number;
  questionCount: number;
}

interface TransitionViewProps {
  currentSubtestName: string;
  nextSubtestName: string;
  onNext: () => void;
  onExit: () => void;
  subtests: SubtestInfo[];
  currentOrder: number;
  breakTimeRemainingSec: number | null;
}

export function TransitionView({
  currentSubtestName,
  nextSubtestName,
  onNext,
  subtests,
  currentOrder,
  breakTimeRemainingSec,
}: TransitionViewProps) {
  const isLastSubtest =
    subtests.length > 0 &&
    currentOrder === Math.max(...subtests.map((s) => s.order));
  const nextSubtest = subtests.find((s) => s.order === currentOrder + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 text-text-body">
      <div className="max-w-3xl w-full bg-surface rounded-xl border border-border overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left: Break / Next Subtest Summary */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div>
            <div className="inline-flex items-center gap-2 h-6 px-2.5 rounded-full bg-success-soft text-success-text text-xs font-semibold mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Subtes {currentOrder} selesai</span>
            </div>

            <h2 className="text-h2 text-text mb-1">
              {currentSubtestName} selesai
            </h2>
            <p className="text-sm text-text-body mb-6">
              Jawaban kamu pada subtes ini sudah dikunci dan tersimpan.
            </p>

            {isLastSubtest ? (
              <div className="bg-surface-muted rounded-lg border border-border p-5 mb-6">
                <p className="text-label text-primary mb-1">
                  Status akhir
                </p>
                <h3 className="text-h3 text-text mb-2">
                  Semua subtes selesai
                </h3>
                <p className="text-sm text-text-body">
                  Kumpulkan sekarang untuk melihat rekap nilai dan pembahasan.
                </p>
              </div>
            ) : (
              <div className="bg-surface-muted rounded-lg border border-border p-5 mb-6">
                <p className="text-label text-text-muted mb-2">
                  Jeda antar subtes
                </p>
                <div className="font-mono text-5xl font-bold text-primary leading-none my-3 tabular-nums">
                  {String(Math.floor((breakTimeRemainingSec ?? 0) / 60)).padStart(2, "0")}:{String((breakTimeRemainingSec ?? 0) % 60).padStart(2, "0")}
                </div>
                <div className="pt-3 mt-3 border-t border-border">
                  <div className="text-label text-text-muted">
                    Berikutnya · Subtes {currentOrder + 1}
                  </div>
                  <div className="text-lg font-bold text-text mt-0.5">
                    {nextSubtestName}
                  </div>
                  {nextSubtest && (
                    <div className="text-xs text-text-muted mt-1 tabular-nums">
                      {nextSubtest.questionCount} soal ·{" "}
                      {nextSubtest.durationMinutes} menit
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={onNext}
            variant="primary"
            size="lg"
            className="w-full justify-center"
          >
            {isLastSubtest ? "Kumpulkan" : "Lanjut sekarang"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right: Subtest Stepper */}
        <div className="bg-surface-muted p-6 sm:p-8 md:col-span-5 flex flex-col">
          <h3 className="text-label text-text-muted mb-4">
            Urutan subtes ({subtests.length})
          </h3>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {subtests.map((sub) => {
              const isFinished = sub.order <= currentOrder;
              const isNext = sub.order === currentOrder + 1;

              return (
                <div
                  key={sub.id}
                  className={`p-3 rounded-md border flex items-start justify-between gap-2 transition-colors ${
                    isNext
                      ? "bg-surface border-primary ring-1 ring-primary"
                      : isFinished
                        ? "bg-surface-muted border-border text-text-muted"
                        : "bg-surface border-border text-text-body"
                  }`}
                >
                  <div>
                    <div className="text-label text-text-muted tabular-nums">
                      Subtes 0{sub.order}
                    </div>
                    <div className="font-semibold text-sm text-text">
                      {sub.name}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {sub.questionCount}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sub.durationMinutes}m
                      </span>
                    </div>
                  </div>
                  <span
                    className={`h-6 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center ${
                      isFinished
                        ? "bg-success-soft text-success-text"
                        : isNext
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {isFinished ? "Selesai" : isNext ? "Berikut" : "Menunggu"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
