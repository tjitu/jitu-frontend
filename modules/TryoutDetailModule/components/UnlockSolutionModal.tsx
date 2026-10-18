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
            <span>KONFIRMASI COINS</span>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-blue-900">
            Pakai {cost} {cost === 1 ? "coin" : "coins"} untuk {label}?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-700 pt-1">
            {isSufficient ? (
              <>
                Sisa coins jadi{" "}
                <span className="font-mono font-medium text-blue-900">
                  {remaining} coins
                </span>
                . Ini tidak bisa dibatalkan.
              </>
            ) : (
              <>
                Coins kamu{" "}
                <span className="font-mono font-medium text-blue-900">
                  {userBalance} coins
                </span>
                . Beli paket mulai Rp8.900 untuk buka hasil ini.
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
                <span>COINS DIPAKAI</span>
              </span>
              <span className="font-medium text-slate-900">{cost} {cost === 1 ? "coin" : "coins"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 uppercase tracking-wider">
                SALDO SAAT INI
              </span>
              <span className="font-medium text-slate-900">
                {userBalance} coins
              </span>
            </div>
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-900 uppercase tracking-wider">
                SISA COINS
              </span>
              <span className={isSufficient ? "text-blue-600 font-semibold" : "text-rose-600 font-semibold"}>
                {userBalance - cost} coins
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
            Batal
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
                  <span>Pakai {cost} {cost === 1 ? "coin" : "coins"}</span>
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
              Beli coins
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnlockSolutionModal;
