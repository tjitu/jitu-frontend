import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface UnlockSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tryoutTitle: string;
  tryoutNumber?: string | number;
  tokenCost: number;
  userBalance: number;
  isLoading: boolean;
  error?: string;
}

export function UnlockSolutionModal({
  isOpen,
  onClose,
  onConfirm,
  tryoutTitle,
  tryoutNumber,
  tokenCost,
  userBalance,
  isLoading,
  error,
}: UnlockSolutionModalProps) {
  const router = useRouter();
  const cost = tokenCost || 1;
  const isSufficient = userBalance >= cost;
  const remaining = Math.max(0, userBalance - cost);
  const label = tryoutNumber ? `Tryout #${tryoutNumber}` : tryoutTitle;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            <Lock className="w-3.5 h-3.5" />
            KONFIRMASI KUOTA
          </div>
          <DialogTitle className="font-display text-xl font-bold text-blue-900">
            Pakai {cost} kuota untuk {label}?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-700 pt-1">
            {isSufficient ? (
              <>
                Sisa kuota jadi{" "}
                <span className="font-mono font-medium text-blue-900">
                  {remaining}
                </span>
                . Ini tidak bisa dibatalkan.
              </>
            ) : (
              <>
                Kuota kamu{" "}
                <span className="font-mono font-medium text-blue-900">
                  {userBalance}
                </span>
                . Beli paket mulai Rp12.000 untuk buka hasil ini.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <div className="bg-blue-50 p-4 border-2 border-blue-900 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 uppercase tracking-[0.06em]">
                TRYOUT
              </span>
              <span className="font-sans font-semibold text-blue-900 text-right">
                {tryoutTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 uppercase tracking-[0.06em]">
                KUOTA DIPAKAI
              </span>
              <span className="font-medium text-blue-900">{cost} kuota</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 uppercase tracking-[0.06em]">
                SALDO SAAT INI
              </span>
              <span className="font-medium text-blue-900">
                {userBalance} kuota
              </span>
            </div>
            <div className="h-[1.5px] bg-blue-200 my-1" />
            <div className="flex justify-between items-center font-medium">
              <span className="text-blue-900 uppercase tracking-[0.06em]">
                SISA KUOTA
              </span>
              <span className={isSufficient ? "text-blue-700" : "text-danger"}>
                {userBalance - cost} kuota
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border-2 border-danger text-danger text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          {isSufficient ? (
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                `Pakai ${cost} kuota`
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                onClose();
                router.push("/shop");
              }}
              variant="default"
            >
              Beli kuota
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
