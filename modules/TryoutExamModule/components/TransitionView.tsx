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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-slate-900">
      <div className="max-w-3xl w-full bg-white border border-slate-200 shadow-2xl grid grid-cols-1 md:grid-cols-12">
        {/* Left: Break / Next Subtest Summary */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 font-mono text-xs uppercase tracking-wider mb-4 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              SUBTES {currentOrder} SELESAI
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
              {currentSubtestName} selesai
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Jawaban kamu pada subtes ini sudah dikunci dan tersimpan.
            </p>

            {isLastSubtest ? (
              <div className="bg-slate-50 border border-slate-200 p-5 mb-6">
                <p className="font-mono text-xs uppercase tracking-wider text-blue-600 font-semibold mb-1">
                  STATUS AKHIR
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                  Semua subtes selesai
                </h3>
                <p className="text-sm text-slate-600">
                  Kumpulkan sekarang untuk melihat rekap nilai dan pembahasan.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 text-white border border-slate-800 p-5 mb-6 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">
                  JEDA ANTAR SUBTES
                </p>
                <div className="font-mono text-5xl font-bold text-amber-400 leading-none my-3">
                  00:{String(breakTimeRemainingSec ?? 0).padStart(2, "0")}
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    BERIKUTNYA · SUBTES {currentOrder + 1}
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">
                    {nextSubtestName}
                  </div>
                  {nextSubtest && (
                    <div className="font-mono text-xs text-slate-400 mt-1">
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
            {isLastSubtest ? "Kumpulkan ujian" : "Lanjut sekarang"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Right: Subtest Stepper */}
        <div className="bg-slate-50 p-6 sm:p-8 md:col-span-5 flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-wider text-slate-700 font-semibold mb-4">
            URUTAN SUBTES ({subtests.length})
          </h3>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {subtests.map((sub) => {
              const isFinished = sub.order <= currentOrder;
              const isNext = sub.order === currentOrder + 1;

              return (
                <div
                  key={sub.id}
                  className={`p-3 border flex items-start justify-between gap-2 transition-colors ${
                    isNext
                      ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600"
                      : isFinished
                        ? "bg-slate-100/80 border-slate-200 text-slate-500"
                        : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider font-medium text-slate-400">
                      SUBTES 0{sub.order}
                    </div>
                    <div className="font-semibold text-sm text-slate-900">
                      {sub.name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
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
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                        : isNext
                          ? "bg-amber-100 border-amber-300 text-amber-950 font-bold"
                          : "bg-slate-100 border-slate-200 text-slate-400"
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
