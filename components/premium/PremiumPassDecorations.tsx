import styles from "./PremiumPassCard.module.css";

interface DoodleProps {
  className: string;
  path: string;
  viewBox?: string;
}

function Doodle({ className, path, viewBox = "0 0 68 48" }: DoodleProps) {
  return (
    <svg className={`${styles.doodle} ${className}`} viewBox={viewBox} fill="none">
      <path d={path} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PremiumPassDecorations() {
  return (
    <div className={styles.decorations} aria-hidden="true">
      <Doodle className={styles.topLeft} path="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10" />
      <Doodle className={styles.topCenter} path="M8 38C22 34 38 18 30 8C22-2 12 14 30 22C48 30 58 16 66 10" />
      <Doodle className={styles.bottomCenter} path="M6 26C16 12 24 14 26 22C28 30 20 32 18 24C16 14 32 16 44 26C54 34 60 26 64 18" />
      <Doodle className={styles.bottomRight} path="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10" />
      <Doodle className={styles.bottomLeft} viewBox="0 0 80 36" path="M6 18C20 22 34 24 46 16C54 10 52 2 44 6C36 10 42 22 56 20C68 18 72 12 76 10" />
      <svg className={`${styles.doodle} ${styles.star}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
    </div>
  );
}
