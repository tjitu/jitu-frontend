import { useEffect } from "react";
import type { ComponentType } from "react";
import styles from "./BreakIntro.module.css";

interface BreakIntroProps {
  nextLabel: string;
  Icon: ComponentType<{ className?: string; size?: number }>;
  onDismiss: () => void;
}

export function BreakIntro({ nextLabel, Icon, onDismiss }: BreakIntroProps) {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dismissIfHidden = () => {
      if (document.visibilityState !== "visible" || motion.matches) onDismiss();
    };
    dismissIfHidden();
    document.addEventListener("visibilitychange", dismissIfHidden);
    motion.addEventListener("change", dismissIfHidden);
    return () => {
      document.removeEventListener("visibilitychange", dismissIfHidden);
      motion.removeEventListener("change", dismissIfHidden);
    };
  }, [onDismiss]);

  return (
    <button
      type="button"
      aria-label={`Subtes selesai. Subtes selanjutnya, ${nextLabel}. Lewati animasi.`}
      className={`${styles.screen} fixed inset-0 z-50 grid place-items-center overflow-hidden bg-white px-6 text-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary`}
      onClick={onDismiss}
      onAnimationEnd={(event) => { if (event.target === event.currentTarget) onDismiss(); }}
    >
      <svg aria-hidden="true" viewBox="0 0 100 100" fill="none" className={`${styles.seal} col-start-1 row-start-1 size-28 text-success sm:size-32`}>
        <circle className={styles.ripple} cx="50" cy="50" r="34" stroke="currentColor" />
        <circle cx="50" cy="50" r="33" className="fill-success-soft" />
        <circle className={styles.ring} cx="50" cy="50" r="34" pathLength="1" transform="rotate(-90 50 50)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path className={styles.tick} d="m35 50 10 10 21-22" pathLength="1" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-hidden="true" className="col-start-1 row-start-1 flex w-full max-w-3xl flex-col items-center">
        <span className={styles.icon}><Icon size={56} className="size-12 text-blue-600 sm:size-14" /></span>
        <span className={`${styles.kicker} mt-4 font-display text-sm font-semibold text-blue-700`}>Subtes selanjutnya</span>
        <span className="mt-2 overflow-hidden pb-1">
          <span className={`${styles.name} block text-balance break-words font-display text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-5xl`}>{nextLabel}</span>
        </span>
      </span>
    </button>
  );
}
