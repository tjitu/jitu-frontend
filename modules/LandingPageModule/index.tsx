"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  Check,
  Clock,
  Flag,
  Menu,
  School,
  Users,
  X,
} from "lucide-react";
import { TryoutSlotCard, TryoutSlotItem } from "@/components/ui/tryout-slot";

/* -------------------------------------------------------------------------- */
/* Canonical Fact Sheet Data (WRITING.md Section 7 & DESIGN.md Sections 6-7)  */
/* -------------------------------------------------------------------------- */

const TRYOUT_SLOTS: TryoutSlotItem[] = [
  {
    id: "to-01",
    number: 1,
    title: "Tryout #1 dibuka",
    displayDate: "2 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "open",
    href: "/register",
  },
  {
    id: "to-02",
    number: 2,
    title: "Minggu ke-2",
    displayDate: "9 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-03",
    number: 3,
    title: "Minggu ke-3",
    displayDate: "16 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-04",
    number: 4,
    title: "Minggu ke-4",
    displayDate: "23 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-05",
    number: 5,
    title: "Minggu ke-5",
    displayDate: "30 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-last",
    number: 6,
    title: "Gelombang penutup",
    displayDate: "21 Apr 2027",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan · 1 kuota",
    state: "upcoming",
    href: "/register",
  },
];

interface QuotaPack {
  id: string;
  quota: number;
  totalPrice: number;
  perTryout: number;
  note: string;
  isBestValue?: boolean;
}

const QUOTA_PACKS: QuotaPack[] = [
  {
    id: "pack-1",
    quota: 1,
    totalPrice: 15000,
    perTryout: 15000,
    note: "Rp15.000 untuk 1 kuota",
  },
  {
    id: "pack-3",
    quota: 3,
    totalPrice: 35000,
    perTryout: 11667,
    note: "Rp35.000 untuk 3 kuota (Rp11.667 per tryout)",
  },
  {
    id: "pack-5",
    quota: 5,
    totalPrice: 55000,
    perTryout: 11000,
    note: "Rp55.000 untuk 5 kuota (Rp11.000 per tryout)",
  },
  {
    id: "pack-10",
    quota: 10,
    totalPrice: 95000,
    perTryout: 9500,
    note: "Rp95.000 untuk 10 kuota (Rp9.500 per tryout)",
    isBestValue: true,
  },
];

const SUBTEST_SAMPLE_SCORES = [
  { code: "PU", name: "Penalaran Umum", score: 672, barClass: "bg-blue-700" },
  { code: "PPU", name: "Pengetahuan dan Pemahaman Umum", score: 634, barClass: "bg-blue-500" },
  { code: "PBM", name: "Pemahaman Bacaan dan Menulis", score: 658, barClass: "bg-blue-700" },
  { code: "PK", name: "Pengetahuan Kuantitatif", score: 594, barClass: "bg-blue-300" },
  { code: "LBI", name: "Literasi dalam Bahasa Indonesia", score: 688, barClass: "bg-blue-900" },
  { code: "LBE", name: "Literasi dalam Bahasa Inggris", score: 645, barClass: "bg-blue-500" },
  { code: "PM", name: "Penalaran Matematika", score: 648, barClass: "bg-signal", highlight: true },
];

function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/* -------------------------------------------------------------------------- */
/* 1. Sticky Top Navigation                                                   */
/* -------------------------------------------------------------------------- */

function LandingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-blue-50/95 backdrop-blur-sm border-b-2 border-blue-900">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Mark: Logo + jitu. */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Beranda Jitu"
            className="min-h-[44px] inline-flex items-center gap-2.5 focus:outline-3 focus:outline-blue-500 focus:outline-offset-2"
          >
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={54}
              height={36}
              priority
              className="h-9 w-auto object-contain"
            />
            <span className="font-display font-extrabold text-[28px] tracking-[-0.025em] text-blue-900 leading-none">
              jitu<span className="text-blue-500">.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
          {[
            { href: "#cara-kerja", label: "Cara kerja" },
            { href: "#jadwal", label: "Jadwal" },
            { href: "#harga", label: "Biaya & kuota" },
            { href: "#peserta", label: "Peserta" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="min-h-[44px] px-3.5 inline-flex items-center text-[15px] font-semibold text-blue-900 hover:bg-blue-100 transition-colors focus:outline-3 focus:outline-blue-500 focus:outline-offset-2"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Auth Actions (WRITING.md Section 4 & 6: 1-3 words, verb first) */}
        <div className="hidden sm:flex items-center gap-2">
          {isLoggedIn ? (
            <Link href="/dashboard" className="jitu-btn-blue text-[14px] font-semibold inline-flex items-center gap-2">
              <span>Kerjakan</span>
              <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="jitu-btn-secondary text-[14px] font-semibold inline-flex items-center justify-center bg-white"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="jitu-btn-blue text-[14px] font-semibold inline-flex items-center justify-center"
              >
                Daftar gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden min-h-[44px] min-w-[44px] border-2 border-blue-900 bg-white text-blue-900 inline-flex items-center justify-center"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-blue-900 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col divide-y divide-slate-300 border-2 border-blue-900">
            {[
              { href: "#cara-kerja", label: "Cara kerja" },
              { href: "#jadwal", label: "Jadwal" },
              { href: "#harga", label: "Biaya & kuota" },
              { href: "#peserta", label: "Peserta" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3 inline-flex items-center justify-between text-[16px] font-semibold text-blue-900 hover:bg-blue-50"
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="col-span-2 jitu-btn-blue text-[14px] font-semibold inline-flex items-center justify-center gap-2"
              >
                <span>Kerjakan</span>
                <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="jitu-btn-secondary text-[14px] font-semibold inline-flex items-center justify-center"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="jitu-btn-blue text-[14px] font-semibold inline-flex items-center justify-center"
                >
                  Daftar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Hero Right: Borderless Pixel Art Pattern of Top Indonesian Universities */
/* -------------------------------------------------------------------------- */

const PIXEL_PATTERN_BLOCKS: Array<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}> = [
  // Top-left & upper sky pixel clusters (around UI Rektorat spire)
  { x: 6, y: 12, w: 2, h: 2, color: "#93C5FD" },
  { x: 10, y: 10, w: 1, h: 1, color: "#60A5FA" },
  { x: 14, y: 14, w: 2, h: 2, color: "#3B82F6" },
  { x: 18, y: 8, w: 2, h: 2, color: "#1D4ED8" },
  { x: 22, y: 12, w: 3, h: 2, color: "#2563EB" },
  { x: 28, y: 6, w: 2, h: 2, color: "#60A5FA" },
  { x: 32, y: 10, w: 2, h: 2, color: "#1D4ED8" },
  { x: 8, y: 22, w: 2, h: 2, color: "#60A5FA" },
  { x: 12, y: 20, w: 3, h: 2, color: "#2563EB" },
  { x: 4, y: 28, w: 2, h: 2, color: "#93C5FD" },
  { x: 8, y: 32, w: 2, h: 2, color: "#3B82F6" },

  // Upper-center & top-right dither pattern (above ITB Aula Barat & UGM Balairung)
  { x: 44, y: 8, w: 2, h: 2, color: "#60A5FA" },
  { x: 48, y: 12, w: 2, h: 2, color: "#1D4ED8" },
  { x: 52, y: 6, w: 1, h: 1, color: "#93C5FD" },
  { x: 62, y: 10, w: 2, h: 2, color: "#3B82F6" },
  { x: 66, y: 14, w: 3, h: 2, color: "#1D4ED8" },
  { x: 72, y: 8, w: 2, h: 2, color: "#60A5FA" },
  { x: 78, y: 12, w: 2, h: 2, color: "#2563EB" },
  { x: 84, y: 10, w: 2, h: 2, color: "#93C5FD" },
  { x: 88, y: 16, w: 2, h: 2, color: "#3B82F6" },
  { x: 92, y: 12, w: 1, h: 1, color: "#60A5FA" },
  { x: 94, y: 20, w: 2, h: 2, color: "#1D4ED8" },
  { x: 96, y: 26, w: 2, h: 2, color: "#93C5FD" },

  // Lower-left & bottom-right pattern fade (extending the isometric campus plaza)
  { x: 6, y: 72, w: 2, h: 2, color: "#3B82F6" },
  { x: 10, y: 76, w: 3, h: 2, color: "#1D4ED8" },
  { x: 16, y: 80, w: 2, h: 2, color: "#60A5FA" },
  { x: 12, y: 84, w: 2, h: 2, color: "#93C5FD" },
  { x: 22, y: 86, w: 2, h: 2, color: "#2563EB" },
  { x: 28, y: 90, w: 2, h: 2, color: "#60A5FA" },
  { x: 46, y: 88, w: 3, h: 2, color: "#1D4ED8" },
  { x: 52, y: 92, w: 2, h: 2, color: "#3B82F6" },
  { x: 58, y: 90, w: 2, h: 2, color: "#93C5FD" },
  { x: 74, y: 86, w: 2, h: 2, color: "#1D4ED8" },
  { x: 80, y: 90, w: 2, h: 2, color: "#3B82F6" },
  { x: 86, y: 84, w: 2, h: 2, color: "#60A5FA" },
  { x: 92, y: 78, w: 2, h: 2, color: "#2563EB" },
  { x: 96, y: 72, w: 1, h: 1, color: "#93C5FD" },
];

function CampusPixelArtPattern() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx, y: ny });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Subtle interactive parallax offsets (gentle, not overdone)
  const parallaxX = mousePos.x * 14;
  const parallaxY = mousePos.y * 10;
  const bgParallaxX = -mousePos.x * 18;
  const bgParallaxY = -mousePos.y * 14;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Ilustrasi piksel gedung kampus impian di Indonesia: UI, ITB, dan UGM"
      className="relative w-full flex items-center justify-center lg:justify-end select-none group"
    >
      {/* Background Blue Pixel Matrix Halftone Pattern (borderless, blends into --blue-50) */}
      <svg
        viewBox="0 0 100 100"
        shapeRendering="crispEdges"
        aria-hidden="true"
        style={{
          transform: `translate3d(${bgParallaxX}px, ${bgParallaxY}px, 0)`,
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="absolute -inset-4 sm:-inset-8 lg:-inset-12 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] lg:w-[calc(100%+6rem)] h-[calc(100%+2rem)] sm:h-[calc(100%+4rem)] lg:h-[calc(100%+6rem)] opacity-90 pointer-events-none"
      >
        <defs>
          {/* Subtle 4x4 pixel grid dot pattern in dominant blue */}
          <pattern
            id="jitu-blue-pixel-dots"
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="1" height="1" fill="#93C5FD" fillOpacity="0.55" />
            <rect x="2" y="2" width="1" height="1" fill="#3B82F6" fillOpacity="0.35" />
          </pattern>
          {/* Stepped pixel mask so the pattern has a pixelated, non-rectangular silhouette */}
          <mask id="jitu-pixel-cluster-mask">
            <rect x="0" y="0" width="100" height="100" fill="black" />
            <rect x="14" y="18" width="74" height="64" fill="white" />
            <rect x="8" y="26" width="84" height="48" fill="white" />
            <rect x="22" y="10" width="56" height="80" fill="white" />
            <rect x="4" y="36" width="92" height="28" fill="white" />
          </mask>
        </defs>

        {/* Pixelated halftone field */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="url(#jitu-blue-pixel-dots)"
          mask="url(#jitu-pixel-cluster-mask)"
        />

        {/* Dominant blue scattered pixel blocks radiating outward with subtle twinkle */}
        {PIXEL_PATTERN_BLOCKS.map((b, idx) => (
          <rect
            key={idx}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.color}
            className="jitu-pixel-blink"
            style={{
              animationDelay: `${(idx * 0.19) % 2.8}s`,
            }}
          />
        ))}
      </svg>

      {/* Main Borderless Pixel Art Panorama (shifted right + ambient breathing zoom float + parallax) */}
      <div
        className="relative z-10 w-full lg:w-[136%] xl:w-[146%] lg:translate-x-8 xl:translate-x-14 lg:-mr-16 xl:-mr-24 pointer-events-none"
        style={{
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          transition: "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <div className="jitu-campus-float transition-transform duration-500 group-hover:scale-[1.035]">
          <Image
            src="/campus-pixel-art.png"
            alt="Ilustrasi pixel art gedung kampus top Indonesia: Gedung Rektorat UI, Aula Barat ITB, dan Balairung UGM"
            width={1268}
            height={596}
            priority
            unoptimized
            style={{ imageRendering: "pixelated" }}
            className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(23,71,232,0.08)]"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Landing Page Component                                                */
/* -------------------------------------------------------------------------- */

const LandingPageModule = () => {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 flex flex-col selection:bg-signal selection:text-blue-900 overflow-x-hidden">
      {/* 1. Navigation */}
      <LandingNav isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        {/* 2. Hero Section (Copy Left, Big Borderless Pixel Art Pattern Right) */}
        <section className="py-12 lg:py-20 border-b-2 border-blue-900 bg-blue-50 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left Column: Hero Copy (WRITING.md Sections 2, 4, 6) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6 relative z-20">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 border-[1.5px] border-blue-900 bg-white font-mono text-[12px] tracking-[0.04em] text-blue-900 font-medium">
                  <span>#RaihKampusImpian 🥇</span>
                </div>

                {/* H1: <= 10 words, inverted headline (WRITING.md Section 2 & 6) */}
                <h1 className="font-display font-extrabold text-[44px] sm:text-[56px] xl:text-[68px] leading-[1.02] tracking-[-0.025em] text-blue-900">
                  Kerjakan gratis. Bayar kalau mau tahu salahnya di mana.
                </h1>

                {/* Hero support line: <= 25 words, colloquial, what it is -> cost -> when */}
                <p className="text-[18px] text-slate-700 leading-[1.5] max-w-xl">
                  Tryout SNBT tiap minggu mulai 2 Nov 2026. Jumlah benar, salah, dan kosong langsung keluar gratis. Skor IRT dan pembahasan dibuka pakai 1 kuota.
                </p>

                {/* Primary Signal CTA (1-3 words, verb first) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    className="jitu-btn-primary text-[16px] font-bold inline-flex items-center justify-center gap-2.5"
                  >
                    <span>{isLoggedIn ? "Kerjakan" : "Daftar gratis"}</span>
                    <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                  </Link>

                  <a
                    href="#jadwal"
                    className="jitu-btn-secondary text-[16px] font-semibold inline-flex items-center justify-center gap-2 bg-white"
                  >
                    <span>Lihat jadwal</span>
                  </a>
                </div>

                {/* Exam Sheet Spec Grid (Fact sheet numbers only) */}
                <div className="pt-4 grid grid-cols-3 border-2 border-blue-900 bg-white divide-x divide-slate-300">
                  <div className="p-3">
                    <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      KERJAKAN TRYOUT
                    </div>
                    <div className="font-mono font-medium text-[22px] text-blue-900 tabular-nums mt-0.5">
                      Rp0
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      SKOR IRT &amp; PEMBAHASAN
                    </div>
                    <div className="font-mono font-medium text-[22px] text-blue-500 tabular-nums mt-0.5">
                      1 kuota
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      MULAI DARI
                    </div>
                    <div className="font-mono font-medium text-[22px] text-blue-900 tabular-nums mt-0.5">
                      Rp9.500
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Big Borderless Pixel Art Pattern of Top Universities */}
              <div className="lg:col-span-7 xl:col-span-7 relative z-10 lg:pl-4">
                <CampusPixelArtPattern />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Cara Kerja — 3-Step Flow + Tanpa Bayar vs Pakai Kuota */}
        <section
          id="cara-kerja"
          className="py-16 lg:py-24 bg-white border-b-2 border-blue-900"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="max-w-2xl space-y-2">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                CARA KERJA
              </div>
              <h2 className="font-display font-extrabold text-[34px] sm:text-[56px] leading-[1.02] tracking-[-0.025em] text-blue-900">
                Gimana cara ikutnya?
              </h2>
              <p className="text-[18px] text-slate-700">
                Simulasi tryout gratis dikerjakan. Kuota hanya dipakai kalau kamu butuh pembahasan dan evaluasi skor IRT.
              </p>
            </div>

            {/* 3 Concrete Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-blue-900 bg-blue-50 space-y-3">
                <div className="font-mono text-[28px] font-bold text-blue-500">
                  01
                </div>
                <h3 className="font-display text-[20px] font-bold text-blue-900">
                  Daftar &amp; kerjakan gratis
                </h3>
                <p className="text-[15px] text-slate-700 leading-relaxed">
                  Bikin akun gratis tanpa syarat kartu kredit. Pilih jadwal tryout mingguan mulai 2 Nov 2026 dan kerjakan 7 subtes SNBT dengan batas waktu riil.
                </p>
              </div>

              <div className="p-6 border-2 border-blue-900 bg-blue-50 space-y-3">
                <div className="font-mono text-[28px] font-bold text-blue-500">
                  02
                </div>
                <h3 className="font-display text-[20px] font-bold text-blue-900">
                  Skor keluar seketika
                </h3>
                <p className="text-[15px] text-slate-700 leading-relaxed">
                  Begitu selesai mengumpulkan jawaban, rekap jumlah benar, salah, dan kosong langsung tampil di layar secara cuma-cuma.
                </p>
              </div>

              <div className="p-6 border-2 border-blue-900 bg-blue-50 space-y-3">
                <div className="font-mono text-[28px] font-bold text-blue-500">
                  03
                </div>
                <h3 className="font-display text-[20px] font-bold text-blue-900">
                  Buka pembahasan kalau butuh
                </h3>
                <p className="text-[15px] text-slate-700 leading-relaxed">
                  Pakai 1 kuota untuk melihat skor IRT resmi dan pembahasan detail tiap butir soal. Kalau nilaimu sudah aman, kuotamu tetap utuh.
                </p>
              </div>
            </div>

            {/* Comparison Box: Tanpa Bayar vs Pakai 1 Kuota */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-blue-900 bg-white divide-y-2 md:divide-y-0 md:divide-x-2 divide-blue-900">
              {/* Tanpa Bayar (Rp0) */}
              <div className="p-6 sm:p-8 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700 font-semibold">
                    TANPA BAYAR
                  </span>
                  <span className="px-2.5 py-1 border border-blue-900 bg-blue-100 font-mono text-[13px] font-bold text-blue-900">
                    Rp0
                  </span>
                </div>
                <h4 className="font-display text-[22px] font-bold text-blue-900">
                  Simulasi tryout mingguan
                </h4>
                <ul className="space-y-3 text-[15px] text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Ikut tryout mingguan sesuai jadwal mulai 2 Nov 2026</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Lengkap 7 subtes standar SNBT (TPS dan Literasi)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Hasil instan: jumlah benar, salah, dan kosong langsung keluar</span>
                  </li>
                </ul>
              </div>

              {/* Pakai 1 Kuota */}
              <div className="p-6 sm:p-8 space-y-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-700 font-semibold">
                    DENGAN 1 KUOTA
                  </span>
                  <span className="px-2.5 py-1 border border-blue-900 bg-signal text-blue-900 font-mono text-[13px] font-bold">
                    Mulai Rp9.500
                  </span>
                </div>
                <h4 className="font-display text-[22px] font-bold text-blue-900">
                  Semua yang gratis, ditambah evaluasi penuh
                </h4>
                <ul className="space-y-3 text-[15px] text-blue-900">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Skor IRT total dan rincian nilai tiap 7 subtes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Kunci jawaban dan pembahasan langkah demi langkah tiap nomor</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 stroke-[2] text-blue-600 shrink-0 mt-0.5" />
                    <span>Kuota tidak pernah hangus, bebas dipakai kapan saja sampai 21 Apr 2027</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Schedule — Slot Grid on Ink (WRITING.md Section 6 & 7) */}
        <section
          id="jadwal"
          className="py-16 lg:py-24 bg-blue-900 text-white border-b-2 border-blue-900"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-8">
            <div className="border-b border-slate-600 pb-6">
              {/* H2: <= 8 words, sentence case, number/date first */}
              <h2 className="font-display font-extrabold text-[34px] sm:text-[56px] leading-[1.02] tracking-[-0.025em] text-white">
                Tryout tiap minggu mulai 2 Nov 2026.
              </h2>
            </div>

            {/* Slot Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRYOUT_SLOTS.map((slot) => (
                <TryoutSlotCard
                  key={slot.id}
                  slot={{
                    ...slot,
                    href: isLoggedIn ? "/dashboard/tryout" : slot.href,
                  }}
                  onDark
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. How to Pay — Question Heading + Formula Block + Price Table (WRITING.md Sections 2, 4, 6, 7, 8) */}
        <section
          id="harga"
          className="py-16 lg:py-24 bg-blue-50 border-b-2 border-blue-900"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="max-w-2xl space-y-2">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                MULAI RP9.500 PER TRYOUT
              </div>
              {/* H2: Reader's question, answered by the next line (WRITING.md Section 2 & 6) */}
              <h2 className="font-display font-extrabold text-[34px] sm:text-[56px] leading-[1.02] tracking-[-0.025em] text-blue-900">
                Bayarnya gimana?
              </h2>
              <p className="text-[18px] text-slate-700">
                Tryout gratis. Kuota cuma buat pembahasan. Makin banyak kuota, makin murah per tryout.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Free vs 1 Kuota Table + Canonical Formula Block */}
              <div className="lg:col-span-5 space-y-6">
                {/* Free vs Paid Comparison Box */}
                <div className="bg-white border-2 border-blue-900 divide-y-2 divide-blue-900">
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium text-blue-900">
                        KERJAKAN TRYOUT
                      </span>
                      <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-blue-100 font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
                        Rp0
                      </span>
                    </div>
                    <p className="text-[16px] text-blue-900 pt-1">
                      Semua tryout gratis dikerjakan. Begitu kamu kumpulkan jawaban, jumlah benar, salah, dan kosong langsung keluar.
                    </p>
                  </div>

                  <div className="p-5 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium text-blue-900">
                        SKOR IRT &amp; PEMBAHASAN
                      </span>
                      <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-blue-500 text-white font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
                        1 KUOTA
                      </span>
                    </div>
                    <p className="text-[16px] text-blue-900 pt-1">
                      1 kuota membuka skor IRT dan pembahasan tiap soal untuk satu tryout. Kalau nilaimu sudah aman dan nggak butuh pembahasan, kuotamu utuh.
                    </p>
                  </div>
                </div>

                {/* Canonical Formula + Worked Example Block (WRITING.md Section 2 & 6) */}
                <div className="p-5 border-2 border-blue-900 bg-signal-100 text-blue-900 space-y-3">
                  <div className="space-y-1">
                    <div className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium text-signal-700">
                      HARGA PER TRYOUT
                    </div>
                    <div className="font-mono text-[16px] font-medium text-blue-900">
                      harga paket ÷ jumlah kuota
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-900/30 space-y-1">
                    <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      Contoh: 5 kuota
                    </div>
                    <div className="font-mono text-[16px] font-medium text-blue-900 tabular-nums">
                      Rp55.000 ÷ 5 = Rp11.000 per tryout
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Price Table (WRITING.md Section 4 & 7) */}
              <div className="lg:col-span-7 bg-white border-2 border-blue-900 shadow-[4px_4px_0_var(--blue-900)]">
                <div className="px-5 py-4 border-b-2 border-blue-900 bg-blue-800 text-white flex items-center justify-between">
                  <span className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
                    HARGA PAKET KUOTA
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-200">
                    MULAI RP9.500 PER TRYOUT
                  </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-blue-900 bg-blue-50 font-mono text-[12px] uppercase tracking-[0.06em] text-blue-900">
                        <th className="py-3.5 px-5 text-left font-medium">Paket</th>
                        <th className="py-3.5 px-5 text-left font-medium">Rincian</th>
                        <th className="py-3.5 px-5 text-right font-medium">Per tryout</th>
                        <th className="py-3.5 px-5 text-right font-medium">Harga paket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {QUOTA_PACKS.map((pack) => (
                        <tr
                          key={pack.id}
                          className={`transition-colors ${
                            pack.isBestValue
                              ? "bg-signal hover:bg-signal"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <td className="py-4 px-5 font-mono font-medium text-[16px] text-blue-900 tabular-nums whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{pack.quota} kuota</span>
                              {pack.isBestValue && (
                                <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-white font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900">
                                  Rp9.500 / tryout
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-5 text-[14px] text-blue-900">
                            {pack.note}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-[14px] text-blue-900 tabular-nums whitespace-nowrap">
                            {formatRupiah(pack.perTryout)}
                          </td>
                          <td className="py-4 px-5 text-right font-mono font-medium text-[18px] text-blue-900 tabular-nums whitespace-nowrap">
                            {formatRupiah(pack.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked List */}
                <div className="sm:hidden divide-y divide-slate-300">
                  {QUOTA_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      className={`p-4 space-y-2 ${
                        pack.isBestValue ? "bg-signal" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[18px] text-blue-900 tabular-nums">
                            {pack.quota} kuota
                          </span>
                          {pack.isBestValue && (
                            <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-white font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900">
                              Rp9.500 / tryout
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-medium text-[18px] text-blue-900 tabular-nums">
                          {formatRupiah(pack.totalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[14px] text-slate-700">
                        <span>{pack.note}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer Action */}
                <div className="p-5 border-t-2 border-blue-900 bg-blue-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-[14px] text-slate-700">
                    1 kuota untuk 1 tryout. Bisa dipakai di jadwal mana saja sampai 21 Apr 2027.
                  </div>
                  <Link
                    href={isLoggedIn ? "/dashboard/shop" : "/register"}
                    className="jitu-btn-blue text-[14px] font-semibold inline-flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>{isLoggedIn ? "Beli kuota" : "Daftar gratis"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Social Proof — 300+ siswa, 14 sekolah, [BRACKETED PLACEHOLDERS] (WRITING.md Section 7) */}
        <section
          id="peserta"
          className="py-16 lg:py-24 bg-white border-b-2 border-blue-900"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            {/* Top Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-6 space-y-2">
                <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                  PESERTA TRYOUT
                </div>
                {/* H2: <= 8 words, sentence case, fact sheet numbers */}
                <h2 className="font-display font-extrabold text-[34px] sm:text-[56px] leading-[1.02] tracking-[-0.025em] text-blue-900">
                  300+ siswa dari 14 sekolah.
                </h2>
              </div>
              {/* Section intro: <= 2 sentences */}
              <p className="lg:col-span-6 text-[18px] text-slate-700 leading-relaxed">
                Dipakai siswa SMA di Jakarta untuk persiapan SNBT. Cerita dan skor siswa baru dipasang setelah Tryout #1 pada 2 Nov 2026 selesai.
              </p>
            </div>

            {/* Fact Sheet Numbers + Bracketed Story Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left: Sourced Numbers Only (300+ siswa, 14 sekolah) */}
              <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 border-2 border-blue-900 bg-blue-50 divide-x-2 lg:divide-x-0 lg:divide-y-2 divide-blue-900">
                <div className="p-6 space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-mono text-[12px] uppercase tracking-[0.06em]">
                      SISWA TERDAFTAR
                    </span>
                    <Users className="w-5 h-5 stroke-[1.75] text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="font-display font-extrabold text-[44px] sm:text-[56px] leading-[1.02] text-blue-500 tabular-nums">
                    300+
                  </div>
                  <p className="text-[14px] text-slate-700">
                    Siswa SMA yang ikut persiapan SNBT
                  </p>
                </div>

                <div className="p-6 space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-mono text-[12px] uppercase tracking-[0.06em]">
                      ASAL SEKOLAH
                    </span>
                    <School className="w-5 h-5 stroke-[1.75] text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="font-display font-extrabold text-[44px] sm:text-[56px] leading-[1.02] text-blue-900 tabular-nums">
                    14
                  </div>
                  <p className="text-[14px] text-slate-700">
                    SMA di Jakarta
                  </p>
                </div>
              </div>

              {/* Right: Honest [BRACKETED PLACEHOLDERS] (WRITING.md Section 7) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-dashed border-slate-500 bg-blue-50 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      <span>[SLOT CERITA #1]</span>
                      <span className="inline-flex items-center gap-1 px-2 py-[2px] border border-blue-900 bg-white text-blue-900">
                        <Flag className="w-3 h-3 stroke-[1.75]" aria-hidden="true" />
                        <span>2 Nov 2026</span>
                      </span>
                    </div>
                    <div className="font-mono text-[14px] font-medium text-blue-900">
                      [NAMA SISWA · ASAL SMA DI JAKARTA]
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed">
                      [KUTIPAN ASLI SISWA SETELAH MENGERJAKAN TRYOUT #1 DAN MEMBUKA PEMBAHASAN]
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-300 font-mono text-[12px] text-slate-700">
                    Belum ada testimoni sebelum Tryout #1 dimulai.
                  </div>
                </div>

                <div className="p-6 border-2 border-dashed border-slate-500 bg-blue-50 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                      <span>[SLOT CERITA #2]</span>
                      <span className="inline-flex items-center gap-1 px-2 py-[2px] border border-blue-900 bg-white text-blue-900">
                        <Flag className="w-3 h-3 stroke-[1.75]" aria-hidden="true" />
                        <span>2026/2027</span>
                      </span>
                    </div>
                    <div className="font-mono text-[14px] font-medium text-blue-900">
                      [CATATAN SKOR TRYOUT #1 SAMPAI #5]
                    </div>
                    <p className="text-[14px] text-slate-700 leading-relaxed">
                      [PERBANDINGAN SKOR IRT TIAP MINGGU DARI PESERTA YANG MENGIZINKAN DATANYA DITAMPILKAN]
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-300 font-mono text-[12px] text-slate-700">
                    Diisi dari data peserta nyata, bukan karangan.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Blue-500 CTA Band (DESIGN.md Section 6.1 & WRITING.md Section 4) */}
        <section className="py-16 lg:py-20 bg-blue-500 text-white border-b-2 border-blue-900">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-100">
                2 NOV 2026 · 21 APR 2027
              </div>
              {/* H2: <= 8 words, sentence case */}
              <h2 className="font-display font-extrabold text-[34px] sm:text-[56px] leading-[1.02] tracking-[-0.025em] text-white">
                Tryout #1 dibuka 2 Nov 2026.
              </h2>
              <p className="text-[18px] text-blue-100">
                Daftar akun sekarang, gratis. Pas jadwalnya buka, kamu tinggal langsung kerjakan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="jitu-btn-primary text-[16px] font-bold inline-flex items-center justify-center gap-2.5"
              >
                <span>{isLoggedIn ? "Kerjakan" : "Daftar gratis"}</span>
                <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer (DESIGN.md Section 6.1 & WRITING.md Section 2) */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-600">
            <div className="md:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2.5">
                <Image
                  src="/blue-jitu-logo.png"
                  alt="Logo Jitu"
                  width={54}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
                <span className="font-display font-extrabold text-[28px] tracking-[-0.025em] text-white leading-none">
                  jitu<span className="text-signal">.</span>
                </span>
              </div>
              <p className="text-[14px] text-blue-200 max-w-sm leading-relaxed">
                Tryout SNBT tiap minggu mulai 2 Nov 2026 sampai 21 Apr 2027. Gratis dikerjakan. Pembahasan dan skor IRT mulai Rp9.500 per tryout.
              </p>
              <div className="font-mono text-[12px] text-blue-300">
                jituptn.com
              </div>
            </div>

            {/* Subtest Codes with Full Name Under Abbreviation (WRITING.md Section 2) */}
            <div className="md:col-span-4 space-y-2">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-300">
                SUBTES SNBT
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-blue-100">
                {SUBTEST_SAMPLE_SCORES.map((sub) => (
                  <li key={sub.code} className="leading-tight">
                    <span className="font-mono font-medium text-white">{sub.code}</span>
                    <div className="text-blue-200">{sub.name}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-blue-300">
                HALAMAN
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[14px]">
                <a href="#cara-kerja" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Cara kerja
                </a>
                <a href="#jadwal" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Jadwal tryout
                </a>
                <a href="#harga" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Biaya &amp; kuota
                </a>
                <a href="#peserta" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Peserta
                </a>
                <Link href="/login" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Masuk
                </Link>
                <Link href="/register" className="text-white hover:underline min-h-[32px] inline-flex items-center">
                  Daftar gratis
                </Link>
              </div>
            </div>
          </div>

          {/* Plain legal line, small, in normal language (WRITING.md Section 2) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[12px] text-blue-300">
            <span>© 2026 Jitu (jituptn.com).</span>
            <span>1 kuota berlaku untuk 1 pembahasan tryout dan tidak bisa diuangkan kembali.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageModule;
