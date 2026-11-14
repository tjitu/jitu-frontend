import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Lock } from "lucide-react";
import { PixelCoin } from "@/components/ui/pixel-coin";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tryoutTitle: string;
  tokenCost: number;
  isLoading: boolean;
  error?: string;
}

export function RegisterModal({
  isOpen,
  onClose,
  onConfirm,
  tryoutTitle,
  tokenCost,
  isLoading,
  error,
}: RegisterModalProps) {
  const isPaidSolution = tokenCost > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Daftar tryout ini?</DialogTitle>
          <DialogDescription>
            Kamu akan mendaftar pada jadwal{" "}
            <strong className="text-text">{tryoutTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="p-4 rounded-md border border-blue-200 bg-blue-50 flex items-start gap-2.5 text-[14px] text-blue-800">
            <Check className="w-5 h-5 stroke-[1.75] text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-semibold text-text">Gratis dikerjakan (Rp0)</div>
              <p className="text-text-body mt-0.5 text-[13px]">
                Jumlah benar, salah, dan kosong langsung keluar setelah kamu kumpulkan.
              </p>
            </div>
          </div>

          {isPaidSolution && (
            <div className="p-4 rounded-md border border-yellow-300 bg-yellow-100/70 flex items-start gap-2.5 text-[14px] text-yellow-700">
              <Lock className="w-5 h-5 stroke-[1.75] text-yellow-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-semibold text-ink-900 flex items-center gap-1.5">
                  <PixelCoin size={14} />
                  <span>Pembahasan · {tokenCost} coin</span>
                </div>
                <p className="text-text-body mt-0.5 text-[13px]">
                  Coin cuma kepakai kalau kamu mau buka skor IRT dan pembahasan.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3 rounded-md border border-danger/30 bg-danger-soft text-danger-text text-[13px] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 stroke-[1.75] text-danger mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Memproses…" : "Daftar tryout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
