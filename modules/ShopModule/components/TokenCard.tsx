import { TokenPackage } from "../interface";
import { Button } from "@/components/ui/button";

const TokenCard = ({
  pkg,
  onPressBuy,
}: {
  pkg: TokenPackage;
  onPressBuy?: () => void;
}) => {
  const isPopular = Boolean(pkg.popular);

  return (
    <div
      className={`bg-white border-2 border-blue-900 flex flex-col justify-between ${
        isPopular ? "shadow-hard" : ""
      }`}
    >
      <div>
        {/* Top Header Bar */}
        <div
          className={`px-5 py-2.5 border-b-2 border-blue-900 flex items-center justify-between font-mono text-xs uppercase tracking-[0.08em] ${
            isPopular
              ? "bg-blue-800 text-white font-medium"
              : "bg-blue-50 text-blue-900"
          }`}
        >
          <span>{pkg.title}</span>
          {isPopular ? (
            <span className="bg-signal text-blue-900 px-2 py-0.5 text-[10px] font-medium border border-blue-900">
              PALING BANYAK DIPILIH
            </span>
          ) : (
            <span className="text-slate-600">{pkg.tokenAmount}X TRYOUT</span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
              JUMLAH KUOTA
            </div>
            <div className="font-display text-3xl font-bold text-blue-900">
              {pkg.tokenAmount} Kuota
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Buka skor IRT &amp; pembahasan untuk {pkg.tokenAmount} tryout.
              Tidak hangus.
            </p>
          </div>

          <div className="pt-4 border-t-[1.5px] border-blue-100">
            <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
              HARGA PAKET
            </div>
            <div className="font-mono text-3xl font-medium text-blue-900">
              Rp{pkg.finalPrice.toLocaleString("id-ID")}
            </div>
            {pkg.pricePerToken && (
              <div className="font-mono text-xs text-blue-700 mt-1">
                Rp{Number(pkg.pricePerToken).toLocaleString("id-ID")} / tryout
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0">
        <Button
          variant={isPopular ? "default" : "primary"}
          size="lg"
          className="w-full"
          onClick={onPressBuy}
        >
          Beli · QRIS
        </Button>
      </div>
    </div>
  );
};

export default TokenCard;
