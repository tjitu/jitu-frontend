import { TokenPackage } from "../interface";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";

const TokenCard = ({
  pkg,
  onPressBuy,
}: {
  pkg: TokenPackage;
  onPressBuy?: () => void;
}) => {
  const isPopular = Boolean(pkg.popular);
  const isBestValue = pkg.tokenAmount === 10 || pkg.badge === "TERHEMAT";

  return (
    <div
      className={`bg-white border rounded-none flex flex-col justify-between transition-all ${
        isBestValue
          ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/30"
          : isPopular
            ? "border-blue-600 shadow-md ring-1 ring-blue-600"
            : "border-slate-200 shadow-xs hover:border-slate-300"
      }`}
    >
      <div>
        {/* Top Header Bar */}
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between font-mono text-xs uppercase tracking-wider ${
            isBestValue
              ? "bg-emerald-700 text-white font-semibold border-emerald-700"
              : isPopular
                ? "bg-blue-600 text-white font-semibold border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200"
          }`}
        >
          <span>{pkg.title}</span>
          {isBestValue ? (
            <span className="bg-amber-400 text-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-normal inline-flex items-center gap-1">
              🔥 PALING HEMAT
            </span>
          ) : isPopular ? (
            <span className="bg-amber-400 text-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-normal">
              PALING POPULER
            </span>
          ) : (
            <span className="text-slate-500 font-medium">{pkg.tokenAmount}X TRYOUT</span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
              JUMLAH COINS
            </div>
            <div className="flex items-center gap-2.5">
              <PixelCoin size={24} />
              <div className="font-display text-2xl font-bold text-slate-900">
                {pkg.tokenAmount} {pkg.tokenAmount === 1 ? "Coin" : "Coins"}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Buka skor IRT &amp; pembahasan untuk {pkg.tokenAmount} tryout.
              Tidak hangus.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
              HARGA PAKET
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900">
              Rp{pkg.finalPrice.toLocaleString("id-ID")}
            </div>
            {pkg.pricePerToken && (
              <div className="font-mono text-xs text-blue-600 mt-1 font-medium">
                Rp{Number(String(pkg.pricePerToken).replace(/\./g, "")).toLocaleString("id-ID")} / tryout
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0">
        <Button
          variant={isBestValue ? "primary" : isPopular ? "primary" : "outline"}
          size="lg"
          className={`w-full ${isBestValue ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
          onClick={onPressBuy}
        >
          Beli · QRIS
        </Button>
      </div>
    </div>
  );
};

export default TokenCard;
