import Image from "next/image";
import { Loader2, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";

interface PaymentOptionsProps {
  isPremiumPass: boolean;
  tokenAmount: number;
  price: number;
  voucher: {
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    referrerName?: string;
  } | null;
  voucherInput: string;
  validatingVoucher: boolean;
  onVoucherInputChange: (value: string) => void;
  onApplyVoucher: () => void;
  onRemoveVoucher: () => void;
  onPay: () => void;
}

export default function PaymentOptions({
  isPremiumPass, tokenAmount, price, voucher, voucherInput, validatingVoucher,
  onVoucherInputChange, onApplyVoucher, onRemoveVoucher, onPay,
}: PaymentOptionsProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Konfirmasi pembelian</DialogTitle>
        <DialogDescription className="sr-only">
          Periksa pembelian dan nominal sebelum memilih metode pembayaran.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-1 py-1">
        {isPremiumPass ? (
          <div className="flex flex-col items-center gap-1 text-center">
            <Image src="/icons/golden-pass-ticket.png" width={84} height={68} alt="" className="object-contain" />
            <span className="text-lg font-bold text-text">{PREMIUM_PASS_COPY.name}</span>
            <span className="text-sm leading-relaxed text-text-body">{PREMIUM_PASS_COPY.headline}</span>
            <span className="text-sm leading-relaxed text-text-body">{PREMIUM_PASS_COPY.tryoutAccess}</span>
            <span className="text-xs text-text-muted">{PREMIUM_PASS_COPY.activation}</span>
          </div>
        ) : <div className="flex items-center gap-2 text-3xl font-bold text-text">
          {tokenAmount} <PixelCoin size={36} />
          <span className="sr-only">coin</span>
        </div>}
        <div className="text-lg font-semibold text-text">
          {voucher && (
            <span className="mr-2 text-sm font-normal text-text-muted line-through">
              Rp{price.toLocaleString("id-ID")}
            </span>
          )}
          Rp{(voucher?.finalPrice ?? price).toLocaleString("id-ID")}
        </div>
      </div>

      {!voucher ? (
        <div className="space-y-2">
          <label htmlFor="payment-voucher" className="flex items-center gap-1.5 text-sm font-semibold text-text">
            <Ticket className="h-4 w-4 text-primary" />
            Punya kode voucher / diskon?
          </label>
          <div className="flex items-center gap-2">
            <input
              id="payment-voucher"
              type="text"
              placeholder="Masukkan kode..."
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs uppercase text-text placeholder:font-sans placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-primary"
              value={voucherInput}
              onChange={(event) => onVoucherInputChange(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onApplyVoucher();
                }
              }}
            />
            <Button type="button" size="sm" variant="outline" onClick={onApplyVoucher}
              disabled={!voucherInput.trim() || validatingVoucher} className="h-8 px-3 text-xs font-semibold">
              {validatingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gunakan"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-emerald-600">
          <div className="text-sm text-text">
            <div className="font-semibold">{voucher.code} · Hemat {voucher.discountPercent}%</div>
            <div className="mt-1 text-xs text-text-muted">
              Potongan Rp{voucher.discountAmount.toLocaleString("id-ID")}
              {voucher.referrerName ? ` · Referral: ${voucher.referrerName}` : ""}
            </div>
          </div>
          <button type="button" onClick={onRemoveVoucher} aria-label="Hapus voucher"
            className="rounded p-2 text-text-muted hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
          <div className="h-px flex-1 bg-border" />
          <span>Pilih metode pembayaran</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button type="button" onClick={onPay}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left font-semibold text-text transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span>QRIS</span>
          <Image src="/icons/qris.svg" alt="" width={70} height={27} unoptimized />
        </button>
      </div>
    </>
  );
}
