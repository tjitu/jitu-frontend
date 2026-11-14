import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
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
  duration?: number | string | null;
  isLoading: boolean;
  error?: string;
}

export function RegisterModal({
  isOpen,
  onClose,
  onConfirm,
  tryoutTitle,
  tokenCost = 1,
  scheduledStart,
  scheduledEnd,
  duration = 195,
  isLoading,
  error,
}: RegisterModalProps) {
  const displayDuration =
    typeof duration === "number"
      ? `${duration} menit`
      : duration
      ? String(duration).includes("menit")
        ? duration
        : `${duration} menit`
      : "195 menit";

  const displayCost = tokenCost && tokenCost > 0 ? tokenCost : 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl shadow-modal">
        {/* Ilustrasi icon pixelated tanpa border */}
        <div className="flex justify-center pt-2 pb-1">
          <Image
            src="/icons/kuota-ticket-pixel-128.png"
            alt="Tiket Tryout"
            width={76}
            height={76}
            className="object-contain rendering-pixelated select-none pointer-events-none drop-shadow-xs"
            style={{ imageRendering: "pixelated" }}
            priority
            unoptimized
          />
        </div>

        <DialogHeader className="space-y-1 text-center sm:text-center pb-1">
          <DialogTitle className="text-xl font-semibold tracking-tight text-text">
            Daftar tryout ini?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Card Ringkasan Informasi Tryout */}
          <div className="rounded-xl border border-border bg-surface-muted/60 p-4 space-y-3 transition-colors">
            {/* 1. Nama Tryout */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Nama Tryout
              </span>
              <h4 className="font-bold text-blue-950 dark:text-blue-100 text-[15px] sm:text-base leading-snug">
                {tryoutTitle}
              </h4>
            </div>

            {/* 2. Waktu Mulai & Selesai */}
            {scheduledStart && (
              <div className="p-2.5 rounded-lg bg-surface border border-border/80">
                <TryoutScheduleTimeline
                  start={scheduledStart}
                  end={scheduledEnd}
                />
              </div>
            )}

            {/* 3. Waktu Pengerjaan, Biaya Pengerjaan, Biaya Pembahasan */}
            <div className="space-y-2 text-xs pt-1 border-t border-border/60">
              {/* Waktu pengerjaan */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>Waktu pengerjaan</span>
                </span>
                <span className="font-semibold text-text font-mono">
                  {displayDuration}
                </span>
              </div>

              {/* Biaya pengerjaan */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Biaya pengerjaan</span>
                </span>
                <span className="font-semibold text-emerald-700 font-mono">
                  Gratis (Rp0)
                </span>
              </div>

              {/* Biaya pembahasan */}
              <div className="flex items-center justify-between py-0.5">
                <span className="text-text-muted flex items-center gap-2">
                  <PixelCoin size={13} className="shrink-0" />
                  <span>Biaya pembahasan</span>
                </span>
                <span className="font-semibold text-text font-mono flex items-center gap-1">
                  <span>{displayCost} coin</span>
                </span>
              </div>
            </div>
          </div>

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
