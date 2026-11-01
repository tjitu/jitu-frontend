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
          <div className="inline-flex items-center gap-1.5 text-label text-primary mb-1">
            <PixelCoin size={14} />
            <span>Konfirmasi coin</span>
          </div>
          <DialogTitle>
            Pakai {cost} coin untuk {label}?
          </DialogTitle>
          <DialogDescription className="text-sm text-text-body pt-1">
            {isSufficient ? (
              <>
                Sisa coin kamu jadi{" "}
                <span className="font-mono font-semibold text-text tabular-nums">
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
          <div className="bg-surface-muted p-4 rounded-md border border-border space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-label text-text-muted">
                Tryout
              </span>
              <span className="font-semibold text-text text-right">
                {tryoutTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-label text-text-muted flex items-center gap-1">
                <PixelCoin size={12} />
                <span>Coin dipakai</span>
              </span>
              <span className="font-mono font-medium text-text tabular-nums">{cost} coin</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-label text-text-muted">
                Saldo saat ini
              </span>
              <span className="font-mono font-medium text-text tabular-nums">
                {userBalance} coin
              </span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between items-center font-medium">
              <span className="text-label text-text">
                Sisa coin
              </span>
              <span className={isSufficient ? "font-mono text-primary font-semibold tabular-nums" : "font-mono text-danger-text font-semibold tabular-nums"}>
                {Math.max(0, userBalance - cost)} coin
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-md bg-danger-soft border border-danger/30 text-danger-text text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-danger" />
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
              variant="primary"
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
              variant="primary"
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
