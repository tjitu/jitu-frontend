"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  Check,
  Menu,
  Sparkles,
  X,
  BookOpen,
  TrendingUp,
  Target,
  Play,
  CheckCircle2,
  Lightbulb,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";
import { TryoutSlotCard, TryoutSlotItem } from "@/components/ui/tryout-slot";
import { PixelCoin } from "@/components/ui/pixel-coin";

/* -------------------------------------------------------------------------- */
/* Canonical Fact Sheet Data (WRITING.md Section 7 & DESIGN.md Sections 2-7)  */
/* -------------------------------------------------------------------------- */

const TRYOUT_SLOTS: TryoutSlotItem[] = [
  {
    id: "to-01",
    number: 1,
    title: "Tryout #1",
    displayDate: "16 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "open",
    href: "/register",
  },
  {
    id: "to-02",
    number: 2,
    title: "Tryout #2",
    displayDate: "23 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-03",
    number: 3,
    title: "Tryout #3",
    displayDate: "30 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-04",
    number: 4,
    title: "Tryout #4",
    displayDate: "7 Des 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-05",
    number: 5,
    title: "Tryout #5",
    displayDate: "14 Des 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-last",
    number: 6,
    title: "Tryout terakhir",
    displayDate: "21 Apr 2027",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
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
    note: "Cocok untuk coba 1 sesi tryout, cek rincian jawabanmu, dan akses skor IRT.",
  },
  {
    id: "pack-3",
    quota: 3,
    totalPrice: 39000,
    perTryout: 13000,
    note: "Mulai bangun ritme latihan mingguan dan evaluasi subtes yang butuh perbaikan.",
  },
  {
    id: "pack-5",
    quota: 5,
    totalPrice: 59000,
    perTryout: 11800,
    note: "Paling pas untuk persiapan sebulan penuh dan pantau kenaikan skor konsisten.",
  },
  {
    id: "pack-10",
    quota: 10,
    totalPrice: 89000,
    perTryout: 8900,
    note: "Paket lengkap persiapan intensif agar makin percaya diri.",
    isBestValue: true,
  },
];

const SUBTEST_SAMPLE_SCORES = [
  { code: "PU", name: "Penalaran Umum", score: 672, barClass: "bg-primary", vHeight: "78%" },
  { code: "PPU", name: "Pengetahuan dan Pemahaman Umum", score: 634, barClass: "bg-blue-400", vHeight: "68%" },
  { code: "PBM", name: "Pemahaman Bacaan dan Menulis", score: 658, barClass: "bg-primary", vHeight: "75%" },
  { code: "PK", name: "Pengetahuan Kuantitatif", score: 594, barClass: "bg-danger", vHeight: "52%", isLow: true },
  { code: "LBI", name: "Literasi dalam Bahasa Indonesia", score: 688, barClass: "bg-blue-800", vHeight: "88%" },
  { code: "LBE", name: "Literasi dalam Bahasa Inggris", score: 645, barClass: "bg-blue-400", vHeight: "72%" },
  { code: "PM", name: "Penalaran Matematika", score: 648, barClass: "bg-yellow-400", vHeight: "74%", highlight: true },
];

function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/* -------------------------------------------------------------------------- */
/* Blue & Yellow Doodle Accessories & Dot Grid (User Reference Image 2)       */
/* -------------------------------------------------------------------------- */

function BlueYellowDoodles() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none inset-0 absolute overflow-hidden z-0">
      {/* 1. Top-left Blue Loop Doodle (Exact User Crop Reference) */}
      <svg
        className="hidden sm:block absolute top-7 left-[2.5%] w-18 h-14 text-blue-500/80 drop-shadow-xs"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 2. Top-right Yellow Loop Swirl */}
      <svg
        className="hidden sm:block absolute top-7 right-[3%] w-20 h-16 text-yellow-400/85 drop-shadow-xs"
        viewBox="0 0 72 52"
        fill="none"
      >
        <path
          d="M8 38C22 34 38 18 30 8C22 -2 12 14 30 22C48 30 58 16 66 10"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 3. Middle-left Yellow Wave Loop (Beside Copy) */}
      <svg
        className="hidden md:block absolute top-[44%] left-[2%] w-16 h-12 text-yellow-400/80 drop-shadow-xs"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 26C16 12 24 14 26 22C28 30 20 32 18 24C16 14 32 16 44 26C54 34 60 26 64 18"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 4. Middle-right Blue Spring Curl (Beside Rocket) */}
      <svg
        className="hidden lg:block absolute top-[40%] right-[2.5%] w-14 h-16 text-blue-500/75 drop-shadow-xs"
        viewBox="0 0 60 68"
        fill="none"
      >
        <path
          d="M14 58C18 42 24 28 34 20C44 12 50 18 44 28C38 38 26 34 28 20C30 8 46 6 54 14"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 5. Bottom-left Yellow Underline Swoop (Underneath CTAs) */}
      <svg
        className="hidden sm:block absolute bottom-8 left-[5%] w-20 h-10 text-yellow-400/80 drop-shadow-xs"
        viewBox="0 0 80 36"
        fill="none"
      >
        <path
          d="M6 18C20 22 34 24 46 16C54 10 52 2 44 6C36 10 42 22 56 20C68 18 72 12 76 10"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 6. Bottom-right Blue Loop Accent */}
      <svg
        className="hidden md:block absolute bottom-10 right-[5%] w-16 h-12 text-blue-500/75 drop-shadow-xs"
        viewBox="0 0 70 50"
        fill="none"
      >
        <path
          d="M10 16C24 8 38 12 34 26C30 40 18 32 26 20C34 8 52 14 62 30"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* 7. Center-top Subtle Blue Connector Loop */}
      <svg
        className="hidden xl:block absolute top-9 left-[48%] w-12 h-10 text-blue-400/70"
        viewBox="0 0 48 40"
        fill="none"
      >
        <path
          d="M6 26C14 14 20 10 16 6C12 2 8 12 18 16C28 20 34 14 42 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Sticky Navigation (Clean top bar with Yellow "Daftar" Button)           */
/* -------------------------------------------------------------------------- */

function LandingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#metode-3p", label: "Metode 3P" },
    { href: "#jadwal", label: "Jadwal" },
    { href: "#harga", label: "Harga" },
    { href: "#faq", label: "FAQ" },
    { href: "/careers", label: "Hiring", isRoute: true },
  ];

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Mark */}
        <Link
          href="/"
          aria-label="Beranda Jitu"
          className="min-h-[44px] inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Image
            src="/blue-jitu-logo.png"
            alt="Logo Jitu"
            width={48}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
          <span className="font-extrabold text-[24px] tracking-[-0.03em] text-text leading-none">
            jitu<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
          {navLinks.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-[38px] px-3.5 rounded-md inline-flex items-center text-[14px] font-medium text-text-body hover:text-text hover:bg-surface-muted transition-colors duration-[120ms]"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="min-h-[38px] px-3.5 rounded-md inline-flex items-center text-[14px] font-medium text-text-body hover:text-text hover:bg-surface-muted transition-colors duration-[120ms]"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Auth Actions: Yellow "Daftar" Button as Requested */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="min-h-[40px] px-5 py-2 rounded-full bg-yellow-400 text-ink-900 text-[14px] font-bold inline-flex items-center gap-2 hover:bg-yellow-300 active:bg-yellow-500 transition-colors duration-[120ms] shadow-xs"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="min-h-[40px] px-4 py-2 rounded-md text-[14px] font-semibold text-text hover:bg-surface-muted transition-colors duration-[120ms]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="min-h-[40px] px-5 py-2 rounded-full bg-yellow-400 text-ink-900 text-[14px] font-bold inline-flex items-center justify-center hover:bg-yellow-300 active:bg-yellow-500 transition-colors duration-[120ms] shadow-xs"
              >
                Daftar
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
          className="md:hidden min-h-[44px] min-w-[44px] rounded-md border border-border bg-surface text-text inline-flex items-center justify-center hover:bg-surface-muted transition-colors duration-[120ms]"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 shadow-float">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 rounded-md inline-flex items-center justify-between text-[15px] font-medium text-text hover:bg-surface-muted transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] text-text-muted" aria-hidden="true" />
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 rounded-md inline-flex items-center justify-between text-[15px] font-medium text-text hover:bg-surface-muted transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] text-text-muted" aria-hidden="true" />
                </a>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="col-span-2 min-h-[44px] px-4 py-2.5 rounded-full bg-yellow-400 text-ink-900 text-[14px] font-bold inline-flex items-center justify-center gap-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="min-h-[44px] px-4 py-2.5 rounded-full border border-border bg-surface text-text text-[14px] font-semibold inline-flex items-center justify-center"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="min-h-[44px] px-4 py-2.5 rounded-full bg-yellow-400 text-ink-900 text-[14px] font-bold inline-flex items-center justify-center"
                >
                  Daftar
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
/* 2. Hero Visual: Pure Pixel Art Rocket Piercing Clouds (No Text, No Box)    */
/* -------------------------------------------------------------------------- */

function RocketCloudPixelIllustration() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto lg:ml-auto select-none flex items-center justify-center">
      {/* 1. Ambient Cosmic Aura (Soft breathing background depth) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 max-w-[520px] max-h-[420px] m-auto rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,200,31,0.22)_0%,rgba(37,87,219,0.16)_45%,transparent_70%)] blur-2xl pointer-events-none animate-pulse [animation-duration:3s]"
      />

      {/* 2. Thruster Engine Flame Glow (Actively pulsing warm energy) */}
      <div
        aria-hidden="true"
        className="absolute bottom-[18%] left-[16%] w-48 h-48 rounded-full bg-gradient-to-tr from-amber-400/60 via-yellow-300/50 to-transparent blur-xl animate-flame-pulse pointer-events-none z-0"
      />

      {/* 3. Rocket Propulsion Thrust Wave Rings (Expanding shockwaves from engine) */}
      <div aria-hidden="true" className="absolute bottom-[20%] left-[21%] pointer-events-none z-0">
        <div className="w-16 h-16 rounded-full border-2 border-yellow-400/80 animate-thrust-ring-1 absolute inset-0 m-auto" />
        <div className="w-16 h-16 rounded-full border-2 border-yellow-400/80 animate-thrust-ring-2 absolute inset-0 m-auto" />
        <div className="w-16 h-16 rounded-full border-2 border-yellow-400/80 animate-thrust-ring-3 absolute inset-0 m-auto" />
      </div>

      {/* 4. Main Pixel Art Rocket Image (Crisp, solid opaque rocket, completely borderless) */}
      <div className="relative w-full aspect-[4/3] min-h-[320px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center transition-all duration-300 hover:scale-[1.02]">
        <Image
          src="/rocket-curving-achievements.png"
          alt="Ilustrasi pixel art roket melengkung ke atas menembus awan dengan topi wisuda, piala, dan medali"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 620px"
          className="object-contain select-none"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero Section Animated Stats Counter Strip                                  */
/* -------------------------------------------------------------------------- */

function CounterStat({
  target,
  label,
  suffix = "+",
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number | null = null;
    const duration = 1800; // ms
    let animationFrameId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(easeOutCubic(progress) * target);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasAnimated, target]);

  const formatted = new Intl.NumberFormat("id-ID").format(count);

  return (
    <div
      ref={ref}
      aria-label={`${target}${suffix} ${label}`}
      className="flex flex-col items-center text-center px-4 py-4 sm:py-2"
    >
      <div className="text-[32px] sm:text-[38px] lg:text-[42px] font-black text-text tracking-tight leading-none flex items-baseline justify-center">
        <span>{formatted}</span>
        <span className="text-[0.68em] font-bold text-blue-700 ml-0.5 sm:ml-1 select-none">
          {suffix}
        </span>
      </div>
      <div className="text-[13px] sm:text-[14px] font-semibold text-text-muted mt-2 tracking-normal">
        {label}
      </div>
    </div>
  );
}

function HeroStatsBar() {
  return (
    <div className="pt-2 sm:pt-4">
      <div className="max-w-4xl mx-auto rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-xs px-4 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/80 gap-3 sm:gap-0">
          <CounterStat target={50} label="Paket Soal" />
          <CounterStat target={700} label="Materi" />
          <CounterStat target={15000} label="Soal UTBK/Masuk PTN" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Metode 3P Jitu: Pahami · Praktik · Pantau (Penjelasan Fitur Utama)      */
/* -------------------------------------------------------------------------- */

function Metode3PSection() {
  return (
    <section id="metode-3p" className="py-20 lg:py-28 bg-white border-b border-border relative overflow-hidden">
      {/* High-Resolution Crisp White Speckled Paper Texture Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-20 lg:space-y-28">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Alur Belajar Terarah</span>
          </div>
          <h2 className="text-[32px] sm:text-[40px] lg:text-[46px] font-black text-text tracking-tight leading-[1.2]">
            3P:{" "}
            <span className="hashtag-select-badge bg-[#FFD13B] text-black font-black px-2 py-0.5 rounded-xs box-decoration-clone !inline selection:bg-[#FFC81F] selection:text-black">
              Pahami, Praktik, Pantau
            </span>
            .
          </h2>
          <p className="text-[17px] sm:text-[18px] text-text-body leading-relaxed">
            Metode persiapan masuk PTN yang terstruktur. Kamu kuasai konsepnya, drill latihannya, dan pantau progres skor IRT-mu setiap minggu.
          </p>
        </div>

        {/* ================================================================== */}
        {/* 01. Pahami: Materi Konsep Terstruktur per Bab                      */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>01 · Pahami</span>
            </div>

            <h3 className="text-[26px] sm:text-[32px] font-extrabold text-text tracking-tight leading-snug">
              Materi konsep yang tersusun rapi per bab
            </h3>

            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed">
              Video materi dan ringkasan disusun per bab materi, bukan potongan lepas. Kamu pelajari konsep dasarnya, rumus cepatnya, sampai tipe soal yang paling sering keluar di SNBT.
            </p>

            <ul className="space-y-3 text-[14px] text-text-body">
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Video ringkas to-the-point per subtes TPS dan Literasi</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ringkasan rumus praktis dan pola soal yang sering keluar</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Progres tiap bab tersimpan otomatis di akunmu</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-primary font-bold text-[15px] hover:text-primary-hover hover:underline"
              >
                <span>Mulai pelajari materi</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>

          {/* Right: Video & Playlist Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-amber-50/80 p-5 sm:p-8 lg:p-10 flex items-center justify-center min-h-[480px] sm:min-h-[520px] lg:min-h-[540px]">
              <div className="w-full max-w-[380px] sm:max-w-[400px] bg-surface rounded-2xl border border-border shadow-md overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                {/* Video Screen Preview */}
                <div className="relative w-full aspect-video bg-[#151B2B] flex flex-col items-center justify-center text-white overflow-hidden p-3.5 select-none">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#93BAFF_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 text-center space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300">
                      Barisan Aritmetika
                    </div>
                    <div className="font-mono text-[15px] sm:text-[17px] font-bold text-yellow-300 tracking-wide">
                      U<sub>n</sub> = a + (n - 1)b
                    </div>
                    <div className="text-[10px] font-mono text-blue-200">
                      a = 2 · b = 8 · n = 10
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="relative z-10 mt-2.5 w-11 h-11 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <Play className="w-4 h-4 ml-0.5 fill-white" />
                  </div>

                  <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded bg-black/50 text-[10px] font-bold font-mono tracking-wider text-white/90">
                    jitu<span className="text-primary">.</span>
                  </div>
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/90">
                    05:37
                  </div>
                </div>

                {/* Header Information */}
                <div className="p-3.5 border-b border-border/70 bg-surface">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Pengetahuan Kuantitatif
                  </div>
                  <div className="text-[14px] font-bold text-text mt-0.5">
                    Barisan dan Deret Aritmetika
                  </div>
                  <div className="mt-2 w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full w-[45%] rounded-full" />
                  </div>
                </div>

                {/* Playlist Module */}
                <div className="p-2.5 space-y-1.5 bg-bg/40">
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Play className="w-3 h-3 ml-0.5 fill-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold truncate">
                        1. Konsep Dasar Barisan Aritmetika
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Sedang diputar · 6 menit
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border/60 hover:bg-surface-muted transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-surface-muted text-text-muted flex items-center justify-center shrink-0 border border-border">
                      <Play className="w-3 h-3 ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-text truncate">
                        2. Rumus Beda & Suku ke-n
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Video · 7 menit
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border/60 hover:bg-surface-muted transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-surface-muted text-text-muted flex items-center justify-center shrink-0 border border-border">
                      <Play className="w-3 h-3 ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-text truncate">
                        3. Analisis Soal Cerita SNBT
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Video · 8 menit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 02. Praktik: Drill Soal yang Mengikuti Kemampuanmu                */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left on Desktop: Drill Question UI Mockup */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="rounded-3xl bg-emerald-50/80 p-5 sm:p-8 lg:p-10 flex items-center justify-center min-h-[480px] sm:min-h-[520px] lg:min-h-[540px]">
              <div className="w-full max-w-[380px] sm:max-w-[400px] bg-surface rounded-2xl border border-border shadow-md p-4 sm:p-6 space-y-3.5 transition-transform hover:-translate-y-1 duration-300">
                {/* Header Subtest & Segmented Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-text">Pengetahuan Kuantitatif</span>
                    <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                      Soal 4 dari 5
                    </span>
                  </div>
                  {/* 5-Segment Progress Bar */}
                  <div className="grid grid-cols-5 gap-1.5">
                    <div className="h-1.5 bg-emerald-500 rounded-full" />
                    <div className="h-1.5 bg-emerald-500 rounded-full" />
                    <div className="h-1.5 bg-emerald-500 rounded-full" />
                    <div className="h-1.5 bg-emerald-500 rounded-full" />
                    <div className="h-1.5 bg-border rounded-full" />
                  </div>
                </div>

                {/* Question Box */}
                <div className="bg-surface-muted/60 rounded-xl p-3 border border-border/60 text-[13px] text-text leading-relaxed font-medium">
                  Suku ke-10 dari barisan 2, 10, 18, 26, ... adalah ...
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-1.5">
                  {["A. 58", "B. 66", "C. 72"].map((opt) => (
                    <div
                      key={opt}
                      className="px-3 py-2 rounded-xl border border-border text-[12px] text-text bg-surface hover:bg-surface-muted transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{opt}</span>
                    </div>
                  ))}

                  {/* Option D (Active Selected) */}
                  <div className="px-3 py-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-[12px] text-emerald-950 font-bold flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>D. 74</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                      Jawabanmu
                    </span>
                  </div>

                  <div className="px-3 py-2 rounded-xl border border-border text-[12px] text-text bg-surface hover:bg-surface-muted transition-colors flex items-center justify-between cursor-pointer">
                    <span>E. 82</span>
                  </div>
                </div>

                {/* Instant Feedback Banner */}
                <div className="rounded-xl bg-emerald-100/80 border border-emerald-300 p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] font-extrabold text-emerald-950 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Benar! Penjelasan terbuka.</span>
                    </div>
                    <div className="text-[10px] font-medium text-emerald-800 mt-0.5">
                      Tingkat materi: 34% → 41%
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right on Desktop: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>02 · Praktik</span>
            </div>

            <h3 className="text-[26px] sm:text-[32px] font-extrabold text-text tracking-tight leading-snug">
              Drill soal yang mengikuti kemampuanmu
            </h3>

            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed">
              Latihan adaptif per subtes. Tingkat kesulitan menyesuaikan penguasaanmu, jawaban langsung dinilai seketika, dan kamu bisa tahu di bab mana yang masih perlu diperkuat.
            </p>

            <ul className="space-y-3 text-[14px] text-text-body">
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Penguasaan tiap konsep terlacak secara rinci</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Jawaban langsung dinilai tanpa perlu tunggu sesi selesai</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Bisa dicoba gratis setiap hari untuk bangun kebiasaan</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-primary font-bold text-[15px] hover:text-primary-hover hover:underline"
              >
                <span>Coba latihan soal gratis</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 03. Pantau: Tryout Berkala dengan Penilaian IRT Resmi              */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300/80 text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>03 · Pantau</span>
            </div>

            <h3 className="text-[26px] sm:text-[32px] font-extrabold text-text tracking-tight leading-snug">
              Tryout berkala dengan penilaian sistem IRT
            </h3>

            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed">
              Simulasi penuh 7 subtes dengan batas waktu asli SNBT. Begitu selesai, jumlah benar, salah, dan kosong langsung muncul. Kunci jawaban dan skor IRT dibuka hanya dengan 1 coin.
            </p>

            <ul className="space-y-3 text-[14px] text-text-body">
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Skor IRT tiap subtes (TPS, Literasi Indo & Inggris, Penalaran Matematika)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Peringkat nasional dan analisis peluang jurusan impian</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Kunci jawaban dan pembahasan langkah demi langkah tiap butir</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="#jadwal"
                className="inline-flex items-center gap-2 text-primary font-bold text-[15px] hover:text-primary-hover hover:underline"
              >
                <span>Lihat jadwal tryout buka</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </a>
            </div>
          </div>

          {/* Right: Scorecard Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-blue-50/80 p-5 sm:p-8 lg:p-10 flex items-center justify-center min-h-[480px] sm:min-h-[520px] lg:min-h-[540px]">
              <div className="w-full max-w-[380px] sm:max-w-[400px] bg-surface rounded-2xl border border-border shadow-md overflow-hidden transition-transform hover:-translate-y-1 duration-300">
                {/* Header Score Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-blue-100">
                    <span>Try Out Akbar UTBK</span>
                    <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[10px]">7 Subtes</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[38px] font-black tracking-tight leading-none">
                        688
                      </div>
                      <div className="text-[11px] text-blue-200 mt-1">
                        Skor Rata-rata IRT
                      </div>
                    </div>

                    <div className="w-13 h-13 rounded-full border-[3px] border-emerald-400 bg-white/10 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[12px] font-extrabold leading-none">74%</span>
                      <span className="text-[8px] font-medium text-blue-200 leading-none mt-0.5">benar</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">
                    <span>↑ +38 dari tryout sebelumnya</span>
                  </div>
                </div>

                {/* Subtest IRT Progress Bars */}
                <div className="p-4 space-y-2.5 bg-surface">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-text">Grafik Subtes IRT</span>
                    <span className="text-[10px] font-mono text-text-muted">Skor</span>
                  </div>

                  {/* Subtest 1 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text font-medium">Penalaran Umum</span>
                      <span className="font-bold text-text">688</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[86%]" />
                    </div>
                  </div>

                  {/* Subtest 2 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text font-medium">Pengetahuan & Pemahaman Umum</span>
                      <span className="font-bold text-text">671</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[82%]" />
                    </div>
                  </div>

                  {/* Subtest 3 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text font-medium">Pemahaman Bacaan & Menulis</span>
                      <span className="font-bold text-text">652</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[78%]" />
                    </div>
                  </div>

                  {/* Subtest 4 */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text font-medium">Pengetahuan Kuantitatif</span>
                      <span className="font-bold text-amber-600">594</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[64%]" />
                    </div>
                  </div>
                </div>

                {/* Diagnostics Note */}
                <div className="p-3.5 pt-0 space-y-2 bg-surface">
                  <div className="text-[11px] font-bold text-text">Perlu Dipelajari</div>

                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-amber-950">
                        Paling banyak belum tepat di Barisan Aritmetika
                      </div>
                      <div className="text-[10px] text-amber-800 leading-tight mt-0.5">
                        6 dari 9 jawaban belum tepat di Pengetahuan Kuantitatif ada di konsep ini.
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-muted/60 rounded-xl border border-border/80 p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-text">
                        Barisan dan Deret Aritmetika
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        6 belum tepat · Berkembang
                      </div>
                    </div>
                    <Link
                      href="/register"
                      className="px-3 py-1 rounded-md bg-white border border-border text-[11px] font-bold text-ink-900 hover:bg-surface-muted shadow-2xs shrink-0"
                    >
                      Latih
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* PTN Premium Pass Card Component (First-Appearance Animation & Animated Beam)*/
/* -------------------------------------------------------------------------- */

function PtnPremiumPassCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // First appearance: langsung masuk animasinya
            setTimeout(() => {
              setIsSelected(true);
            }, 100);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative w-full rounded-2xl bg-gradient-to-r from-[#143485] via-[#1D4ED8] to-[#163372] text-white p-6 sm:p-8 lg:p-9 border border-blue-400/40 shadow-xl shadow-blue-950/20 hover:border-blue-300/70 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 overflow-hidden"
    >
      {/* 1. Sweeping Ambient Shimmer Light Beam Animation */}
      <div
        aria-hidden="true"
        className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none animate-pass-shimmer"
      />

      {/* 2. Pulsing Ambient Glowing Orbs */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl animate-pulse [animation-duration:4s] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl animate-pulse [animation-duration:6s] pointer-events-none"
      />

      {/* 3. Hand-drawn Yellow & Light Blue Doodle Accessories (Animated, no collision) */}
      {/* Doodle 1: Light Blue Loop Swirl (Top-Left corner) */}
      <svg
        aria-hidden="true"
        className="hidden sm:block absolute top-2 left-[2.5%] w-13 h-11 text-blue-300/60 pointer-events-none drop-shadow-xs rotate-[-15deg] animate-doodle-2"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Doodle 2: Yellow Ribbon Loop Swirl (Centered horizontally between PTN Premium Pass and Rp55.000) */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute top-2 left-[57%] -translate-x-1/2 w-14 h-12 text-[#FFD13B]/80 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M8 38C22 34 38 18 30 8C22 -2 12 14 30 22C48 30 58 16 66 10"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Doodle 3: Light Blue Spring Curl (Bottom-Center space) */}
      <svg
        aria-hidden="true"
        className="hidden lg:block absolute -bottom-1.5 left-[42%] w-14 h-12 text-blue-200/50 pointer-events-none drop-shadow-xs rotate-[8deg] animate-doodle-1"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 26C16 12 24 14 26 22C28 30 20 32 18 24C16 14 32 16 44 26C54 34 60 26 64 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Doodle 4: Second Yellow Accessory - Hand-drawn Curl Loop (Bottom-Right empty space, away from text) */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute -bottom-2 right-[27%] w-15 h-13 text-[#FFD13B]/85 pointer-events-none drop-shadow-xs rotate-[16deg] animate-doodle-2"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Doodle 5: Yellow Sparkle Star (Top-Right edge) */}
      <svg
        aria-hidden="true"
        className="absolute top-4 right-10 w-5 h-5 text-[#FFD13B]/75 pointer-events-none animate-pulse [animation-duration:3s]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>

      {/* Doodle 6: Light Blue Underline Swoop (Bottom-Left) */}
      <svg
        aria-hidden="true"
        className="hidden lg:block absolute bottom-1 left-[3%] w-16 h-8 text-blue-300/40 pointer-events-none"
        viewBox="0 0 80 36"
        fill="none"
      >
        <path
          d="M6 18C20 22 34 24 46 16C54 10 52 2 44 6C36 10 42 22 56 20C68 18 72 12 76 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        {/* Left: Info, Floating Golden Pass Ticket & Benefits */}
        <div className="space-y-4 max-w-2xl">
          {/* Title with Golden Pass Ticket Icon & Scroll-Driven Selection */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Animated Floating Golden Ticket */}
            <div className="w-14 h-12 sm:w-16 sm:h-14 lg:w-20 lg:h-16 shrink-0 relative select-none animate-ticket-float transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/icons/golden-pass-ticket.png"
                alt="Tiket Golden Pass PTN Premium Pass"
                fill
                className="object-contain select-none pointer-events-none drop-shadow-md"
                priority
              />
            </div>

            <div>
              <h3 className="text-[28px] sm:text-[34px] lg:text-[38px] xl:text-[42px] font-black text-white tracking-tight leading-tight flex flex-wrap items-center gap-2.5">
                <span>PTN</span>
                {/* Scroll-driven selection badge */}
                <span className="relative inline-block font-black select-none">
                  {/* Base unselected: crisp white text */}
                  <span className="text-white px-2.5 sm:px-3 py-0.5 inline-block">
                    PREMIUM PASS
                  </span>

                  {/* Selected overlay: yellow badge + black text revealed via wipe animation on first appearance */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#FFD13B] text-black px-2.5 sm:px-3 py-0.5 rounded-xs inline-block shadow-sm overflow-hidden select-none pointer-events-none transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      clipPath: isSelected ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
                    }}
                  >
                    PREMIUM PASS
                  </span>
                </span>
              </h3>
            </div>
          </div>

          {/* 3 Checkmark Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
            <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
              <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Bebas akses pembahasan tryout tanpa coins</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
              <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Materi & latihan soal unlimited</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-blue-100 font-medium">
              <div className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Analisis skor IRT & ranking nasional</span>
            </div>
          </div>
        </div>

        {/* Right: Price & CTA Button with Continuous Spinning Border Beam Animation */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t border-blue-400/30 lg:border-t-0">
          <div className="text-left lg:text-right">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-[32px] sm:text-[38px] lg:text-[40px] font-black text-white leading-none tracking-tight tabular-nums">
                Rp55.000
              </span>
              <span className="text-[14px] sm:text-[15px] font-bold text-blue-200">
                /bulan
              </span>
            </div>
            <div className="text-[12px] text-blue-200/80 font-medium mt-1">
              Akses penuh tanpa batas
            </div>
          </div>

          {/* Button with Continuous Rotating Border Beam */}
          <div className="relative p-[2.5px] rounded-xl overflow-hidden shadow-lg group/btn hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150">
            {/* Spinning Border Beam */}
            <div
              aria-hidden="true"
              className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_60%,rgba(255,255,255,0.95)_80%,#FFD13B_92%,transparent_100%)] pointer-events-none"
            />

            <Link
              href={isLoggedIn ? "/shop" : "/register"}
              className="relative w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-[10px] bg-[#FFD13B] hover:bg-[#ffc81f] active:bg-[#e6b315] text-black font-extrabold text-[15px] inline-flex items-center justify-center gap-2 transition-colors duration-120"
            >
              <span>Ambil Premium Pass</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ Section Component (2-Column Minimalist Accordion Layout)               */
/* -------------------------------------------------------------------------- */

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah semua tryout di JITU beneran 100% gratis?",
    answer:
      "Iya, gratis sepenuhnya! Kamu bisa langsung mendaftar dan mengerjakan seluruh 7 subtes pada jadwal tryout mingguan tanpa dipungut biaya sepeser pun. Begitu selesai, jumlah jawaban benar, salah, dan kosong langsung keluar. Coin atau PTN Premium Pass hanya kamu butuhkan jika ingin membuka pembahasan detail tiap soal, video pembahasan, dan analisis skor IRT.",
  },
  {
    question: "Materi dan subtes apa saja yang diujikan dalam tryout JITU?",
    answer:
      "Tryout JITU mencakup seluruh 7 subtes resmi SNBT: Penalaran Umum (PU), Pengetahuan & Pemahaman Umum (PPU), Pemahaman Bacaan & Menulis (PBM), Pengetahuan Kuantitatif (PK), Literasi Bahasa Indonesia (LBI), Literasi Bahasa Inggris (LBE), dan Penalaran Matematika (PM). Format, tipe soal, dan alokasi waktu dirancang presisi mengikuti standar terbaru BP3 Kemendikbud.",
  },
  {
    question: "Tryout-nya bisa dikerjakan di HP, atau harus pakai laptop?",
    answer:
      "Bisa dua-duanya! Tampilan JITU sudah didesain responsif dan ringan, jadi sangat nyaman digunakan lewat HP, tablet, maupun laptop. Namun untuk merasakan simulasi yang paling mendekati suasana UTBK sesungguhnya, kami menyarankan kamu mengerjakannya lewat laptop atau komputer.",
  },
  {
    question: "Seberapa akurat sistem penilaian skor di JITU dengan UTBK aslinya?",
    answer:
      "Sangat akurat karena JITU menerapkan sistem Item Response Theory (IRT) resmi seperti yang digunakan pada UTBK SNBT. Bobot setiap butir soal dinilai berdasarkan tingkat kesulitan nyata dari seluruh peserta yang menjawab, bukan sekadar persentase benar-salah biasa. Ini memberikan estimasi skor dan ranking nasional yang jauh lebih realistis.",
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden">
      {/* High-Resolution Crisp White Speckled Paper Texture Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      {/* Decorative Ribbon Doodle (Top-Right corner of section) */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute top-6 right-[3%] w-16 h-12 text-blue-200/50 pointer-events-none drop-shadow-xs rotate-[16deg] animate-doodle-2"
        viewBox="0 0 68 48"
        fill="none"
      >
        <path
          d="M6 34C18 18 24 8 14 6C4 4 8 22 24 24C40 26 48 12 62 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Heading & Support Copy */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <h2 className="text-[34px] sm:text-[42px] lg:text-[46px] font-black text-text tracking-tight leading-[1.12]">
              Hal yang sering ditanyakan
            </h2>
            <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed max-w-sm">
              Punya pertanyaan lain seputar tryout, paket, atau kendala teknis? Hubungi kami langsung di{" "}
              <a
                href="mailto:team@jituptn.com"
                className="font-bold text-primary hover:text-blue-700 underline underline-offset-4 decoration-2 transition-colors inline-block"
              >
                team@jituptn.com
              </a>.
            </p>

            {/* Hand-drawn Yellow Ribbon Doodle Accessory */}
            <div className="pt-2 select-none">
              <svg
                aria-hidden="true"
                className="w-16 h-13 sm:w-20 sm:h-16 text-[#FFD13B] pointer-events-none drop-shadow-xs rotate-[-8deg] animate-doodle-1"
                viewBox="0 0 68 48"
                fill="none"
              >
                <path
                  d="M8 38C22 34 38 18 30 8C22 -2 12 14 30 22C48 30 58 16 66 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Right Column: Clean Accordion List */}
          <div className="lg:col-span-7 border-t border-border/80">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div key={idx} className="border-b border-border/80 transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] sm:text-[18px] font-bold text-text group-hover:text-primary transition-colors leading-snug">
                      {item.question}
                    </span>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-muted group-hover:text-text transition-all duration-200 ${
                        isOpen ? "rotate-45 text-primary" : ""
                      }`}
                    >
                      <Plus className="w-5 h-5 stroke-[2.25]" />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0 pb-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[15px] sm:text-[16px] text-text-body leading-relaxed max-w-2xl">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Landing Page Component                                                */
/* -------------------------------------------------------------------------- */

const LandingPageModule = () => {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);

  return (
    <div className="min-h-screen bg-bg text-text-body flex flex-col selection:bg-yellow-200 selection:text-ink-900 relative">
      {/* 1. Navigation */}
      <LandingNav isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        {/* ================================================================== */}
        {/* 2. Hero Section: Rocket Piercing Clouds + Blue/Yellow Doodles      */}
        {/* ================================================================== */}
        <section className="relative py-12 lg:py-20 border-b border-border bg-white overflow-hidden">
          {/* High-Resolution Crisp White Speckled Paper Texture Background (Calibrated for Hero) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/white-speckled-paper-hero.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
          />

          {/* Blue & Yellow Doodle Accessories (Image 2 Reference) */}
          <BlueYellowDoodles />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Authentic Copy (Strict 4 Lines) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Teman Persiapan Masuk PTN 2026/2027</span>
                </div>

                {/* H1: Headline (Gedean dikit lagi: 48px sweet spot) */}
                <h1 className="text-[30px] sm:text-[38px] md:text-[44px] lg:text-[42px] xl:text-[48px] font-extrabold tracking-[-0.035em] text-text leading-[1.18] flex flex-col gap-2">
                  <span className="whitespace-nowrap">Tryout SNBT Gratis,</span>
                  <span className="whitespace-nowrap">
                    Demi{" "}
                    <span className="hashtag-select-badge bg-[#FFD13B] text-black font-black px-2 py-0.5 rounded-xs inline-block selection:bg-[#FFC81F] selection:text-black">
                      #RaihKampusImpian
                    </span>.
                  </span>
                </h1>

                {/* Support Line (WRITING.md §4 & §7) */}
                <p className="text-[17px] sm:text-[18px] text-text-body leading-[1.6] max-w-[56ch]">
                  Latihan SNBT jadi lebih terarah dengan tryout mingguan dari JITU. Selesai mengerjakan, langsung cek hasil jawabanmu. Akses skor IRT dan pembahasan lengkap hanya dengan 1 coin!
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    className="min-h-[48px] px-6 py-3 rounded-md bg-primary text-white text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-pressed transition-colors duration-[120ms] shadow-sm"
                  >
                    <span>{isLoggedIn ? "Buka tryout" : "Daftar gratis"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                  </Link>

                  <a
                    href="#jadwal"
                    className="min-h-[48px] px-6 py-3 rounded-md border border-border bg-surface text-text text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-surface-muted transition-colors duration-[120ms]"
                  >
                    <span>Lihat jadwal</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Pure Pixel Art Rocket (Border-less, no tacky SVG clouds) */}
              <div className="lg:col-span-6 flex items-center justify-center">
                <RocketCloudPixelIllustration />
              </div>
            </div>

            {/* 3. Hero Section Animated Stats: 50+ Paket Soal · 700+ Materi · 15.000+ Soal UTBK/Masuk PTN */}
            <HeroStatsBar />
          </div>
        </section>

        {/* ================================================================== */}
        {/* 2b. Metode 3P Jitu: Pahami · Praktik · Pantau (Penjelasan Utama)   */}
        {/* ================================================================== */}
        <Metode3PSection />



        {/* ================================================================== */}
        {/* 4. Schedule — Jadwal Tryout (WRITING.md §7)                       */}
        {/* ================================================================== */}
        <section id="jadwal" className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden">
          {/* High-Resolution Crisp White Speckled Paper Texture Background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
          />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
            <div className="space-y-2">
              <div className="text-label text-primary">Jadwal tryout</div>
              <h2 className="text-h1 text-text">
                Tryout{" "}
                <span className="hashtag-select-badge bg-[#FFD13B] text-black font-black px-2 py-0.5 rounded-xs inline-block selection:bg-[#FFC81F] selection:text-black">
                  GRATIS
                </span>{" "}
                setiap minggu,
              </h2>
              <p className="text-[15px] sm:text-[16px] text-text-body font-medium">
                (sstt.. ada hadiah ewallet untuk 5 besar setiap tryoutnya)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRYOUT_SLOTS.map((slot) => (
                <TryoutSlotCard
                  key={slot.id}
                  slot={{
                    ...slot,
                    href: isLoggedIn ? "/tryout" : slot.href,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 5. Pricing — Harga & Paket Coin (DESIGN.md §5 & WRITING.md §7)     */}
        {/* ================================================================== */}
        <section id="harga" className="py-16 lg:py-24 bg-white border-b border-border relative overflow-hidden">
          {/* High-Resolution Crisp White Speckled Paper Texture Background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
          />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
            <div className="space-y-2 max-w-xl">
              <div className="text-label text-primary">Biaya & Pembelian</div>
              <h2 className="text-h1 text-text">Bayarnya gimana?</h2>
              <p className="text-[17px] text-text-body">
                Tryout gratis. Coin atau Pass cuma kepakai kalau kamu butuh pembahasan lengkap & analisis skor IRT.
              </p>
            </div>

            {/* 4 Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUOTA_PACKS.map((pack) => {
                const isRecommended = Boolean(pack.isBestValue);

                return (
                  <div
                    key={pack.id}
                    className={`rounded-xl p-6 flex flex-col justify-between gap-6 transition-colors duration-[120ms] ${
                      isRecommended
                        ? "bg-blue-50/50 border-2 border-primary"
                        : "bg-surface border border-border hover:border-blue-300"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header & Ribbon */}
                      <div className="flex items-center justify-between gap-2 min-h-[24px]">
                        <div className="inline-flex items-center gap-2">
                          <PixelCoin size={22} />
                          <span className="text-[20px] font-bold text-text tabular-nums">
                            {pack.quota} coin
                          </span>
                        </div>
                        {isRecommended && (
                          <span className="h-6 px-2.5 rounded-full bg-yellow-300 text-ink-900 text-[11px] font-bold inline-flex items-center">
                            Paling hemat
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="pt-2 border-t border-ink-100">
                        <div className="text-[28px] font-bold text-text leading-tight tabular-nums">
                          {formatRupiah(pack.totalPrice)}
                        </div>
                      </div>

                      <p className="text-[13px] text-text-body leading-relaxed">
                        {pack.note}
                      </p>
                    </div>

                    <Link
                      href={isLoggedIn ? "/shop" : "/register"}
                      className={`w-full min-h-[44px] px-4 py-2.5 rounded-md text-[14px] font-semibold inline-flex items-center justify-center gap-2 transition-colors duration-[120ms] ${
                        isRecommended
                          ? "bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed"
                          : "border border-border bg-surface text-text hover:bg-surface-muted"
                      }`}
                    >
                      <span>Pilih paket</span>
                      <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Separator Divider with "Atau" — Enhanced spacing */}
            <div className="relative flex items-center justify-center my-6 sm:my-8">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-white px-5 font-mono text-[13px] font-bold text-text-muted uppercase tracking-wider">
                Atau
              </span>
            </div>

            {/* PTN PREMIUM PASS — Animated Blue Gradient Card with Floating Golden Pass Ticket */}
            <PtnPremiumPassCard isLoggedIn={isLoggedIn} />
          </div>
        </section>

        {/* ================================================================== */}
        {/* 7. FAQ (2-Column Accordion Layout + Thinking Mascot)               */}
        {/* ================================================================== */}
        <FaqSection />


      </main>

      {/* ================================================================== */}
      {/* 9. Modern Editorial Footer (Matches Pepete Reference Layout)       */}
      {/* ================================================================== */}
      <footer className="bg-[#0B1E48] text-white pt-14 sm:pt-16 lg:pt-20 pb-4 relative overflow-hidden border-t border-blue-900/60">
        {/* Subtle Paper / Grain Texture Background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/white-speckled-paper.svg')] opacity-[0.05] bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10 sm:space-y-12">
          {/* Top Row: Brand Logo (Left) + Horizontal Navigation Links (Right) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
            {/* Brand Logo */}
            <div className="inline-flex items-center gap-2.5">
              <Image
                src="/blue-jitu-logo.png"
                alt="Logo Jitu"
                width={48}
                height={32}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              <span className="font-extrabold text-[26px] tracking-[-0.03em] text-white leading-none">
                jitu<span className="text-yellow-400">.</span>
              </span>
            </div>

            {/* Horizontal Nav Links (Matching Pepete Reference Style) */}
            <nav className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-3 text-[14px] sm:text-[15px] font-medium text-blue-100">
              <a
                href="#harga"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Harga
              </a>
              <a
                href="#jadwal"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Jadwal
              </a>
              <a
                href="#metode-3p"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Metode 3P
              </a>
              <a
                href="#faq"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                FAQ
              </a>
              <Link
                href="/careers"
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 decoration-yellow-400/60 hover:decoration-yellow-300 transition-all"
              >
                Open Hiring 2026
              </Link>
              <Link
                href="/login"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Daftar gratis
              </Link>
              <a
                href="#"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Syarat & Ketentuan
              </a>
              <a
                href="#"
                className="hover:text-white underline underline-offset-4 decoration-blue-400/50 hover:decoration-white transition-all"
              >
                Privasi
              </a>
            </nav>
          </div>

          {/* Middle Row: Contacts (Left) + Copyright (Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] sm:text-[14px] text-blue-200/90 pt-6 border-t border-blue-800/40">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>
                Email{" "}
                <a
                  href="mailto:team@jituptn.com"
                  className="text-white hover:text-yellow-300 underline underline-offset-4 decoration-blue-400/60 transition-colors"
                >
                  team@jituptn.com
                </a>
              </span>
              <span>
                WhatsApp{" "}
                <a
                  href="https://wa.me/628123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-yellow-300 underline underline-offset-4 decoration-blue-400/60 transition-colors"
                >
                  08123456789
                </a>
              </span>
            </div>

            <div className="text-[13px] text-blue-300/80">
              © 2026 PT Jitu Edukasi Nusantara
            </div>
          </div>

          {/* Bottom Row: Giant Oversized Brand Wordmark */}
          <div className="pt-4 sm:pt-8 lg:pt-10 -mb-4 sm:-mb-8 overflow-hidden select-none pointer-events-none">
            <div className="text-[100px] sm:text-[170px] md:text-[230px] lg:text-[290px] xl:text-[340px] font-black tracking-tighter text-white/95 leading-[0.8] select-none text-left">
              jitu<span className="text-yellow-400">.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageModule;
