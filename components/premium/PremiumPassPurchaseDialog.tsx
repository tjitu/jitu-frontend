"use client";

import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";

interface PremiumPassPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivate: () => void;
  price: number;
  loading: boolean;
}

export function PremiumPassPurchaseDialog({ open, onOpenChange, onActivate, price, loading }: PremiumPassPurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <div className="space-y-3 text-center">
          <Image src="/icons/golden-pass-ticket.png" alt="" width={80} height={64} className="mx-auto object-contain" />
          <DialogTitle>{PREMIUM_PASS_COPY.name}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-text-body">
            {PREMIUM_PASS_COPY.headline}
          </DialogDescription>
        </div>
        <ul className="space-y-3 rounded-lg border border-border bg-surface-muted p-4 text-sm text-text-body">
          {[PREMIUM_PASS_COPY.tryoutAccess, PREMIUM_PASS_COPY.practiceAccess, PREMIUM_PASS_COPY.historyAccess].map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
        <p className="text-center text-sm text-text-muted">{PREMIUM_PASS_COPY.activation}</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button type="button" className="flex-1" onClick={onActivate} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading ? "Mengaktifkan Premium…" : `Aktifkan · Rp${price.toLocaleString("id-ID")}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
