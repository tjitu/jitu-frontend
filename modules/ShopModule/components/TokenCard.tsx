import { TokenPackage } from "../interface";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { Check } from "lucide-react";

const TokenCard = ({
  pkg,
  onPressBuy,
}: {
  pkg: TokenPackage;
  onPressBuy?: () => void;
}) => {
  const isBestValue = pkg.tokenAmount === 10 || pkg.badge === "Paling hemat" || pkg.badge === "TERHEMAT";

  return (
    <div
      className={`bg-surface rounded-lg p-6 flex flex-col justify-between transition-colors ${
        isBestValue
          ? "border-2 border-primary"
          : "border border-border hover:border-blue-300"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-2">
            <PixelCoin size={20} />
            <span className="font-bold text-[18px] text-text">
              {pkg.tokenAmount} coin
            </span>
          </div>
          {isBestValue ? (
            <span className="h-6 rounded-full bg-yellow-300 text-ink-900 px-2.5 text-[12px] font-semibold inline-flex items-center">
              Paling hemat
            </span>
          ) : (
            <span className="h-6 rounded-full bg-surface-muted border border-border text-text-muted px-2.5 text-[12px] font-semibold inline-flex items-center">
              {pkg.tokenAmount}x tryout
            </span>
          )}
        </div>

        <div className="mb-5">
          <div className="font-bold text-[28px] leading-tight tracking-[-0.02em] text-text tabular-nums">
            Rp{pkg.finalPrice.toLocaleString("id-ID")}
          </div>
          {pkg.pricePerToken && (
            <div className="text-[13px] text-text-muted mt-1 tabular-nums">
              Rp{Number(String(pkg.pricePerToken).replace(/\./g, "")).toLocaleString("id-ID")} / tryout
            </div>
          )}
        </div>

        <ul className="space-y-2 mb-6 pt-4 border-t border-border text-[13px] text-text-body">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Buka skor IRT &amp; pembahasan {pkg.tokenAmount} tryout</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Berlaku sampai 21 Apr 2027</span>
          </li>
        </ul>
      </div>

      <Button
        variant={isBestValue ? "primary" : "outline"}
        size="lg"
        className="w-full"
        onClick={onPressBuy}
      >
        Beli {pkg.tokenAmount} coin
      </Button>
    </div>
  );
};

export default TokenCard;
