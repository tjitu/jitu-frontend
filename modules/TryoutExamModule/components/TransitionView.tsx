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
    <div className="min-h-screen flex items-center justify-center bg-blue-800 p-4 text-blue-900">
      <div className="max-w-3xl w-full bg-white border-2 border-blue-900 shadow-hard grid grid-cols-1 md:grid-cols-12">
        {/* Left: Break / Next Subtest Summary */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-blue-900">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border-[1.5px] border-success text-success px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SUBTES {currentOrder} SELESAI
            </div>

            <h2 className="font-display text-2xl font-bold text-blue-900 mb-1">
              {currentSubtestName} selesai
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Jawaban kamu pada subtes ini sudah dikunci dan tersimpan.
            </p>

            {isLastSubtest ? (
              <div className="bg-blue-50 border-2 border-blue-900 p-5 mb-6">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
                  STATUS AKHIR
                </p>
                <h3 className="font-display text-xl font-bold text-blue-900 mb-2">
                  Semua subtes selesai
                </h3>
                <p className="text-sm text-slate-700">
                  Kumpulkan sekarang untuk melihat rekap nilai dan pembahasan.
                </p>
              </div>
            ) : (
              <div className="bg-blue-800 text-white border-2 border-blue-900 p-5 mb-6">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-200 mb-2">
                  JEDA ANTAR SUBTES
                </p>
                <div className="font-mono text-5xl font-medium text-signal leading-none my-3">
                  00:{String(breakTimeRemainingSec ?? 0).padStart(2, "0")}
                </div>
                <div className="pt-3 mt-3 border-t border-blue-600">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-blue-200">
                    BERIKUTNYA · SUBTES {currentOrder + 1}
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">
                    {nextSubtestName}
                  </div>
                  {nextSubtest && (
                    <div className="font-mono text-xs text-blue-200 mt-1">
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
            variant="default"
            size="lg"
            className="w-full"
          >
            {isLastSubtest ? "Kumpulkan ujian" : "Lanjut sekarang"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right: Subtest Stepper */}
        <div className="bg-blue-50 p-6 sm:p-8 md:col-span-5 flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-[0.08em] text-blue-900 font-medium mb-4">
            URUTAN SUBTES ({subtests.length})
          </h3>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {subtests.map((sub) => {
              const isFinished = sub.order <= currentOrder;
              const isNext = sub.order === currentOrder + 1;

              return (
                <div
                  key={sub.id}
                  className={`p-3 border-[1.5px] flex items-start justify-between gap-2 ${
                    isNext
                      ? "bg-white border-blue-900 shadow-hard-sm"
                      : isFinished
                        ? "bg-blue-100/60 border-blue-200 text-slate-600"
                        : "bg-white/60 border-blue-200 text-slate-500"
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.06em]">
                      SUBTES 0{sub.order}
                    </div>
                    <div className="font-semibold text-sm text-blue-900">
                      {sub.name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 mt-0.5 flex items-center gap-2">
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
                    className={`font-mono text-[10px] uppercase px-1.5 py-0.5 border ${
                      isFinished
                        ? "bg-emerald-50 border-success text-success"
                        : isNext
                          ? "bg-signal border-blue-900 text-blue-900 font-medium"
                          : "bg-blue-50 border-blue-200 text-slate-500"
                    }`}
                  >
                    {isFinished ? "SELESAI" : isNext ? "BERIKUT" : "MENUNGGU"}
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
