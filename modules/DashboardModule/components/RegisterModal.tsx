import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Sparkles,
  BarChart2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { TryoutScheduleTimeline } from "@/components/ui/tryout-schedule-timeline";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tryoutTitle: string;
  tokenCost?: number;
  scheduledStart?: string | Date | null;
  scheduledEnd?: string | Date | null;
  isLoading: boolean;
  error?: string;
}

export function RegisterModal({
  isOpen,
  onClose,
  onConfirm,
  tryoutTitle,
  tokenCost = 0,
  scheduledStart,
  scheduledEnd,
  isLoading,
  error,
}: RegisterModalProps) {
  const isPaidSolution = tokenCost > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl shadow-modal">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
            <span>Konfirmasi Pendaftaran</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-text">
            Daftar tryout ini?
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            Periksa ringkasan dan ketentuan tryout sebelum kamu mendaftar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Main Rearranged Tryout Summary Card */}
          <div className="rounded-xl border border-border bg-surface-muted/60 p-4 sm:p-4.5 space-y-3 transition-colors">
            {/* Tryout Title + Badges */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Sistem Penilaian IRT</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  Gratis (Rp0)
                </span>
              </div>
              <h4 className="font-bold text-text text-[15px] sm:text-base leading-snug">
                {tryoutTitle}
              </h4>
            </div>

            {/* Schedule timeline if provided */}
            {scheduledStart && (
              <div className="p-3 rounded-lg bg-surface border border-border/80">
                <TryoutScheduleTimeline
                  start={scheduledStart}
                  end={scheduledEnd}
                />
              </div>
            )}

            {/* Breakdown rows */}
            <div className="space-y-2 text-xs pt-1 border-t border-border/60">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Biaya pengerjaan</span>
                </span>
                <span className="font-semibold text-emerald-700 font-mono">
                  Rp0 (Gratis)
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Hasil evaluasi</span>
                </span>
                <span className="font-medium text-text text-right">
                  Benar, salah, &amp; kosong langsung keluar
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Format simulasi</span>
                </span>
                <span className="font-medium text-text text-right">
                  7 Subtes TPS &amp; Literasi
                </span>
              </div>

              {isPaidSolution && (
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-text-muted flex items-center gap-2">
                    <PixelCoin size={13} className="shrink-0" />
                    <span>Skor IRT &amp; Pembahasan</span>
                  </span>
                  <span className="font-medium text-text flex items-center gap-1 font-mono">
                    <span>{tokenCost} coin</span>
                    <span className="text-text-muted font-normal text-[11px] font-sans">
                      (opsional)
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reassuring note */}
          <p className="text-[11.5px] text-text-muted leading-relaxed px-0.5">
            Semua tryout gratis dikerjakan. Setelah mendaftar, tryout akan tersimpan di akun kamu dan siap dikerjakan.
          </p>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg border border-danger/30 bg-danger-soft text-danger-text text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 stroke-[1.75] text-danger mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none h-10 text-xs px-4"
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none h-10 text-xs px-5 font-semibold"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mendaftarkan…</span>
              </span>
            ) : (
              "Daftar tryout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
