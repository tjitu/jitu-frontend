"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";

interface PremiumPassCardProps {
  price: number;
  originalPrice?: number;
  savings?: number;
  campaignName?: string;
  badgeText?: string;
  badgeStyle?: string;
  href?: string;
  onActivate?: () => void;
  isActive?: boolean;
  highlighted?: boolean;
  id?: string;
}

const actionClassName =
  "inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-yellow-300 px-8 py-3 text-base font-extrabold text-ink-900 transition-colors hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 sm:w-auto";

const badgeStyles: Record<string, string> = {
  RED_FIRE: "bg-red-600 text-white",
  GOLD_PREMIUM: "bg-yellow-300 text-ink-900",
  EMERALD_SAVE: "bg-emerald-600 text-white",
  CYAN_ELECTRIC: "bg-blue-600 text-white",
  PURPLE_ROYAL: "bg-purple-600 text-white",
};

export function PremiumPassCard({
  price,
  originalPrice,
  savings,
  campaignName,
  badgeText,
  badgeStyle,
  href = "/shop?highlight=premium-pass",
  onActivate,
  isActive = false,
  highlighted = false,
  id,
}: PremiumPassCardProps) {
  const discount = savings ?? Math.max(0, (originalPrice ?? price) - price);

  return (
    <section
      id={id}
      aria-label={PREMIUM_PASS_COPY.name}
      className={`relative overflow-hidden rounded-xl border border-blue-400/40 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 p-6 text-white sm:p-8 ${highlighted ? "ring-4 ring-yellow-300 ring-offset-4 ring-offset-bg" : ""}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1 space-y-5">
          {(campaignName || badgeText) && (
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {campaignName && <span className="rounded-full border border-yellow-300/40 px-3 py-1 text-yellow-300">{campaignName}</span>}
              {badgeText && <span className={`rounded-full px-3 py-1 ${badgeStyles[badgeStyle ?? "GOLD_PREMIUM"] ?? badgeStyles.GOLD_PREMIUM}`}>{badgeText}</span>}
            </div>
          )}
          <div className="flex items-center gap-3 sm:gap-4">
            <Image src="/icons/golden-pass-ticket.png" alt="" width={80} height={68} className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-20" />
            <h2 className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              <span className="text-white">PTN</span>
              <span className="rounded bg-yellow-300 px-2 py-1 text-ink-900">PREMIUM PASS</span>
            </h2>
          </div>
          <p className="max-w-2xl text-lg font-semibold leading-relaxed text-white sm:text-xl">
            {PREMIUM_PASS_COPY.headline}
          </p>
          <div className="flex items-start gap-2 text-sm leading-relaxed text-blue-100 sm:text-base">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300" aria-hidden="true" />
            <p className="m-0">{PREMIUM_PASS_COPY.tryoutAccess}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-5 border-t border-blue-400/30 pt-5 lg:items-end lg:border-0 lg:pt-0">
          <div>
            {originalPrice && discount > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm lg:justify-end">
                <span className="text-blue-200 line-through">Rp{originalPrice.toLocaleString("id-ID")}</span>
                <span className="rounded bg-yellow-300/15 px-2 py-1 font-bold text-yellow-300">Hemat Rp{discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums">Rp{price.toLocaleString("id-ID")}</span>
              <span className="text-base font-semibold text-blue-200">{PREMIUM_PASS_COPY.period}</span>
            </div>
          </div>
          {isActive ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-4 py-3 text-sm font-bold text-emerald-100">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              {PREMIUM_PASS_COPY.active}
            </div>
          ) : onActivate ? (
            <button type="button" onClick={onActivate} className={actionClassName}>{PREMIUM_PASS_COPY.cta}</button>
          ) : (
            <Link href={href} className={actionClassName}>{PREMIUM_PASS_COPY.cta}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
