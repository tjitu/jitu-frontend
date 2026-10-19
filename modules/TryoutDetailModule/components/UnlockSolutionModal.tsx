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
import { PixelCoin } from "@/components/ui/pixel-coin";

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
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            <PixelCoin size={14} />
            <span>KONFIRMASI COIN</span>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-blue-900">
            Pakai {cost} coin untuk {label}?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-700 pt-1">
            {isSufficient ? (
              <>
                Sisa coin kamu jadi{" "}
                <span className="font-mono font-medium text-blue-900">
                  {remaining} coin
                </span>
                . Ini nggak bisa dibatalkan.
              </>
            ) : (
              <>
                {userBalance === 0
                  ? "Coin kamu habis. Beli coin dulu buat buka pembahasan."
                  : `Coin kamu cuma ${userBalance} coin. Beli coin dulu buat buka pembahasan.`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <div className="bg-slate-50 p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider">
                TRYOUT
              </span>
              <span className="font-sans font-semibold text-slate-900 text-right">
                {tryoutTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <PixelCoin size={12} />
                <span>COIN DIPAKAI</span>
              </span>
              <span className="font-medium text-slate-900">{cost} coin</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider">
                SALDO SAAT INI
              </span>
              <span className="font-medium text-slate-900">
                {userBalance} coin
              </span>
            </div>
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-900 uppercase tracking-wider">
                SISA COIN
              </span>
              <span className={isSufficient ? "text-blue-600 font-semibold" : "text-rose-600 font-semibold"}>
                {Math.max(0, userBalance - cost)} coin
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Nanti dulu
          </Button>
          {isSufficient ? (
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant="default"
              className="inline-flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <PixelCoin size={14} />
                  <span>Pakai {cost} coin</span>
                </>
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
              Beli coin
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnlockSolutionModal;
