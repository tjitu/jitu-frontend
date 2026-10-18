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
            <strong className="text-blue-900">{tryoutTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="p-3.5 border border-blue-200 bg-blue-50/60 flex items-start gap-2.5 text-[14px] text-blue-900">
            <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-semibold text-slate-900">Gratis dikerjakan (Rp0)</div>
              <p className="text-slate-600 mt-0.5 text-[13px]">
                Jumlah benar, salah, dan kosong langsung keluar setelah kamu kumpulkan.
              </p>
            </div>
          </div>

          {isPaidSolution && (
            <div className="p-3.5 border border-amber-200 bg-amber-50/60 flex items-start gap-2.5 text-[14px] text-amber-950">
              <Lock className="w-5 h-5 stroke-[2] text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-semibold text-amber-950">
                  Pembahasan · {tokenCost} kuota
                </div>
                <p className="text-amber-800/80 mt-0.5 text-[13px]">
                  Kuota baru dipakai kalau kamu memilih membuka skor IRT dan pembahasan.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3 border border-rose-200 bg-rose-50 text-rose-800 text-[13px] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 stroke-[2] text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="signal"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Memproses…" : "Daftar gratis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
