"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { PREMIUM_PASS_COPY } from "@/lib/premium-pass-copy";
import { PremiumPassDecorations } from "./PremiumPassDecorations";
import styles from "./PremiumPassCard.module.css";

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
  const benefits = [
    PREMIUM_PASS_COPY.monthlyPractice,
    PREMIUM_PASS_COPY.tryoutAccess,
    PREMIUM_PASS_COPY.rankings,
  ];

  return (
    <section
      id={id}
      aria-label={PREMIUM_PASS_COPY.name}
      className={`${styles.card} ${highlighted ? styles.highlighted : ""}`}
    >
      <PremiumPassDecorations />
      <div className={styles.layout}>
        <div className={styles.information}>
          {(campaignName || badgeText) && (
            <div className={styles.campaigns}>
              {campaignName && <span className={styles.campaign}>{campaignName}</span>}
              {badgeText && <span className={`${styles.campaignBadge} ${badgeStyles[badgeStyle ?? "GOLD_PREMIUM"] ?? badgeStyles.GOLD_PREMIUM}`}>{badgeText}</span>}
            </div>
          )}
          <div className={styles.brand}>
            <Image src="/icons/golden-pass-ticket.png" alt="" width={80} height={72} className={styles.ticket} />
            <h2 className={styles.title}>
              <span className={styles.ptn}>PTN</span>
              <span className={styles.wordmark}>PREMIUM PASS</span>
            </h2>
          </div>
          <ul className={styles.benefits}>
            {benefits.map((benefit) => (
              <li className={styles.benefit} key={benefit}>
                <span className={styles.check}><Check aria-hidden="true" /></span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.purchase}>
          <div className={styles.priceBlock}>
            {originalPrice && discount > 0 && (
              <div className={styles.discount}>
                <span className="line-through">Rp{originalPrice.toLocaleString("id-ID")}</span>
                <span className={styles.saving}>Hemat Rp{discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className={styles.price}>
              <span className={styles.amount}>Rp{price.toLocaleString("id-ID")}</span>
              <span className={styles.period}>{PREMIUM_PASS_COPY.period}</span>
            </div>
            <p className={styles.periodNote}>{PREMIUM_PASS_COPY.bannerDuration}</p>
          </div>
          {isActive ? (
            <div className={styles.active}>
              <CheckCircle2 aria-hidden="true" />
              {PREMIUM_PASS_COPY.active}
            </div>
          ) : (
            <div className={styles.actionFrame}>
              {onActivate ? (
                <button type="button" onClick={onActivate} className={styles.action}>{PREMIUM_PASS_COPY.cta}<ArrowRight aria-hidden="true" /></button>
              ) : (
                <Link href={href} className={styles.action}>{PREMIUM_PASS_COPY.cta}<ArrowRight aria-hidden="true" /></Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
