import React from "react";

export interface SubtestIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. PU - Penalaran Umum (Logic & Neural Cognitive Prism)
 */
export function IconPU({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 20.5 7 20.5 17 12 22 3.5 17 3.5 7" opacity="0.25" fill="currentColor" />
      <polygon points="12 2 20.5 7 20.5 17 12 22 3.5 17 3.5 7" />
      <line x1="12" y1="12" x2="12" y2="2" />
      <line x1="12" y1="12" x2="20.5" y2="17" />
      <line x1="12" y1="12" x2="3.5" y2="17" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
      <circle cx="18.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="5.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 2. PPU - Pengetahuan dan Pemahaman Umum (Illumination & Global Insight)
 */
export function IconPPU({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.25 4.7 3.2 6h7.6C17.75 13.7 19 11.5 19 9a7 7 0 0 0-7-7z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 6v4" />
      <path d="M10 8h4" />
      <line x1="12" y1="2" x2="12" y2="0.5" strokeDasharray="1 1" />
    </svg>
  );
}

/**
 * 3. PBM - Pemahaman Bacaan & Menulis (Editorial Quill & Structured Text)
 */
export function IconPBM({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.12" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="13" y2="13" />
      <line x1="8" y1="17" x2="11" y2="17" />
      <path d="M18.5 12.5l2.5 2.5-6.5 6.5H12v-2.5l6.5-6.5z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

/**
 * 4. PK - Pengetahuan Kuantitatif (Arithmetic & Algebraic Operators)
 */
export function IconPK({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.1" />
      <line x1="7.5" y1="6.5" x2="7.5" y2="9.5" />
      <line x1="6" y1="8" x2="9" y2="8" />
      <line x1="15" y1="6.5" x2="18" y2="9.5" />
      <line x1="18" y1="6.5" x2="15" y2="9.5" />
      <line x1="6" y1="16" x2="9" y2="16" />
      <circle cx="16.5" cy="14" r="0.75" fill="currentColor" />
      <line x1="15" y1="16" x2="18" y2="16" />
      <circle cx="16.5" cy="18" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * 5. LBI - Literasi Bahasa Indonesia (Classical Open Tome & Red Ribbon)
 */
export function IconLBI({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z" fill="currentColor" fillOpacity="0.15" />
      <path d="M9 2v8l3-2.5 3 2.5V2" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

/**
 * 6. LBE - Literasi Bahasa Inggris (International Globe & Dialogue)
 */
export function IconLBE({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M12 3a13 13 0 0 0 0 18" />
      <path d="M12 3a13 13 0 0 1 0 18" />
    </svg>
  );
}

/**
 * 7. PM - Penalaran Matematika (Geometry Compass & Function Curve)
 */
export function IconPM({ className = "w-5 h-5", size = 20 }: SubtestIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <path d="M12 7l-6 13" />
      <path d="M12 7l6 13" />
      <path d="M8.5 15a6.5 6.5 0 0 0 7 0" fill="currentColor" fillOpacity="0.2" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}

export * from "./subtest-meta";
