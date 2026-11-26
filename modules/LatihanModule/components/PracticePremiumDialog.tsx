"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";

export type PremiumModalReason = "LIMIT" | "SUBTEST" | "HISTORY" | "UPGRADE";

interface PracticePremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: PremiumModalReason;
  price: number;
}

const reasonDescriptions: Record<PremiumModalReason, string> = {
  LIMIT: "Batas 10 soal hari ini tercapai. Latihan gratis tersedia lagi besok pukul 00:00 WIB.",
  SUBTEST: "Pilih subtes yang ingin kamu latih selama Premium aktif.",
  HISTORY: "Buka kembali riwayat latihan dan pembahasan soal selama Premium aktif.",
  UPGRADE: "Latihan semua subtes SNBT sesuai kebutuhanmu selama sebulan.",
};

export function PracticePremiumDialog({ open, onOpenChange, reason, price }: PracticePremiumDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        {reason === "LIMIT" && (
          <p className="flex items-start gap-2 rounded-lg border border-border bg-surface-muted p-3 text-sm text-text-body" role="status">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {reasonDescriptions.LIMIT}
          </p>
        )}
        <div className="space-y-3">
          <Image src="/icons/golden-pass-ticket.png" alt="" width={72} height={58} className="object-contain" />
          <p className="text-sm font-bold text-primary">{PREMIUM_PASS_COPY.name}</p>
          <DialogTitle className="text-xl font-bold leading-snug">{PREMIUM_PASS_COPY.headline}</DialogTitle>
          <DialogDescription>{reason === "LIMIT" ? PREMIUM_PASS_COPY.tryoutAccess : reasonDescriptions[reason]}</DialogDescription>
        </div>
        <ul className="space-y-3 text-sm text-text-body">
          {[PREMIUM_PASS_COPY.practiceAccess, PREMIUM_PASS_COPY.historyAccess, ...(reason === "LIMIT" ? [] : [PREMIUM_PASS_COPY.tryoutAccess])].map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-text">Rp{price.toLocaleString("id-ID")}</span>
            <span className="text-sm text-text-muted">{PREMIUM_PASS_COPY.period}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{reason === "LIMIT" ? "Tunggu besok" : "Nanti"}</Button>
            <Button asChild><Link href="/shop?highlight=premium-pass">{PREMIUM_PASS_COPY.cta}</Link></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
