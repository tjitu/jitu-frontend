"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  Check,
  Menu,
  School,
  Sparkles,
  Users,
  X,
  BookOpen,
  TrendingUp,
  Target,
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
    displayDate: "2 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "open",
    href: "/register",
  },
  {
    id: "to-02",
    number: 2,
    title: "Tryout #2",
    displayDate: "9 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-03",
    number: 3,
    title: "Tryout #3",
    displayDate: "16 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-04",
    number: 4,
    title: "Tryout #4",
    displayDate: "23 Nov 2026",
    windowLabel: "Gratis dikerjakan",
    subtestInfo: "Pembahasan 1 coin",
    state: "upcoming",
    href: "/register",
  },
  {
    id: "to-05",
    number: 5,
    title: "Tryout #5",
    displayDate: "30 Nov 2026",
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
    note: "Rp15.000 untuk 1 coin",
  },
  {
    id: "pack-3",
    quota: 3,
    totalPrice: 39000,
    perTryout: 13000,
    note: "Rp39.000 untuk 3 coin (Rp13.000 per tryout)",
  },
  {
    id: "pack-5",
    quota: 5,
    totalPrice: 59000,
    perTryout: 11800,
    note: "Rp59.000 untuk 5 coin (Rp11.800 per tryout)",
  },
  {
    id: "pack-10",
    quota: 10,
    totalPrice: 89000,
    perTryout: 8900,
    note: "Rp89.000 untuk 10 coin (Rp8.900 per tryout)",
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

const TARGET_CAMPUSES = [
  { name: "UI", fullName: "Universitas Indonesia", score: "680+", src: "/ui.png" },
  { name: "ITB", fullName: "Institut Teknologi Bandung", score: "695+", src: "/itb.png" },
  { name: "UGM", fullName: "Universitas Gadjah Mada", score: "675+", src: "/ugm.webp" },
  { name: "ITS", fullName: "ITS Surabaya", score: "660+", src: "/its.png" },
  { name: "UNAIR", fullName: "Universitas Airlangga", score: "650+", src: "/unair.png" },
  { name: "UNPAD", fullName: "Universitas Padjadjaran", score: "645+", src: "/unpad.webp" },
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
      {/* Crisp Dot Matrix Grid (User Reference Aesthetic) */}
      <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(#3B82F6_1.25px,transparent_1.25px)] [background-size:24px_24px]" />

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

      {/* 8. Bottom-center Yellow Playful Curl */}
      <svg
        className="hidden lg:block absolute bottom-7 left-[46%] w-14 h-11 text-yellow-400/80 drop-shadow-xs"
        viewBox="0 0 56 44"
        fill="none"
      >
        <path
          d="M6 30C14 16 22 10 16 6C10 2 8 18 22 20C36 22 42 12 50 10"
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
    { href: "#cara-kerja", label: "Cara kerja" },
    { href: "#jadwal", label: "Jadwal" },
    { href: "#harga", label: "Harga" },
    { href: "#peserta", label: "Peserta" },
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
        <section className="relative py-12 lg:py-20 border-b border-border bg-gradient-to-b from-blue-50/50 via-bg to-bg overflow-hidden">
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
          </div>
        </section>

        {/* ================================================================== */}
        {/* 3. Cara Kerja — 3-Step Flow + Free vs Paid Comparison (WRITING.md) */}
        {/* ================================================================== */}
        <section id="cara-kerja" className="relative py-16 lg:py-24 bg-surface border-b border-border overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-label text-primary">Cara kerja</div>
              <h2 className="text-h1 text-text">Gimana cara ikutnya?</h2>
              <p className="text-[17px] text-text-body leading-[1.6]">
                Tryout-nya gratis. Coin cuma kepakai kalau kamu mau lihat skor IRT dan pembahasan.
              </p>
            </div>

            {/* 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  tag: "Gratis Rp0",
                  title: "Daftar, lalu kerjakan",
                  body: "Bikin akun gratis, pilih jadwal tryout yang lagi buka, terus kerjain 7 subtes SNBT dengan batas waktu.",
                },
                {
                  step: "02",
                  tag: "Instan",
                  title: "Skor langsung keluar",
                  body: "Begitu dikumpulin, jumlah benar, salah, dan kosongmu langsung kelihatan di layar. Tanpa potong coin.",
                },
                {
                  step: "03",
                  tag: "1 coin",
                  title: "Buka pembahasan kalau perlu",
                  body: "Pakai 1 coin buat lihat skor IRT dan pembahasan tiap soal. Kalau nilaimu udah aman, coin-mu tetap utuh.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-bg rounded-xl border border-border p-6 space-y-4 hover:border-blue-300 transition-colors duration-[120ms]"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-blue-50 text-blue-800 font-mono text-[13px] font-bold tabular-nums">
                      Langkah {item.step}
                    </span>
                    <span className="text-[12px] font-medium text-text-muted">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-h3 text-text">{item.title}</h3>
                  <p className="text-[14px] text-text-body leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Comparison Box: Gratis (Rp0) vs Pakai 1 Coin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gratis (Rp0) */}
              <div className="rounded-xl bg-surface border border-border p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-ink-100">
                  <div>
                    <div className="text-label text-text-muted">Tanpa coin</div>
                    <h3 className="text-[20px] font-bold text-text mt-1">
                      Kerjakan tryout mingguan
                    </h3>
                  </div>
                  <span className="h-7 px-3 rounded-full bg-success-soft text-success-text font-mono text-[13px] font-bold inline-flex items-center">
                    Gratis (Rp0)
                  </span>
                </div>

                <ul className="space-y-3 text-[14px] text-text-body">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>Tryout mingguan mulai 2 Nov 2026 sampai 21 Apr 2027</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>7 subtes SNBT lengkap (TPS dan Literasi, 155 soal)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>Jumlah benar, salah, dan kosong langsung keluar di layar</span>
                  </li>
                </ul>
              </div>

              {/* Pakai 1 Coin */}
              <div className="rounded-xl bg-blue-50/70 border-2 border-primary p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-blue-200">
                  <div>
                    <div className="text-label text-primary">Skor IRT &amp; pembahasan</div>
                    <h3 className="text-[20px] font-bold text-text mt-1">
                      Semua yang gratis, plus:
                    </h3>
                  </div>
                  <span className="h-7 px-3 rounded-full bg-yellow-300 text-ink-900 font-mono text-[13px] font-bold inline-flex items-center gap-1.5">
                    <PixelCoin size={14} />
                    <span>Mulai Rp8.900</span>
                  </span>
                </div>

                <ul className="space-y-3 text-[14px] text-text">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Skor IRT total dan rincian nilai per subtes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Kunci jawaban dan pembahasan langkah demi langkah tiap nomor</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>Coin berlaku sampai 21 Apr 2027 di tryout mana aja</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 4. Schedule — Jadwal Tryout (WRITING.md §7)                       */}
        {/* ================================================================== */}
        <section id="jadwal" className="py-16 lg:py-24 bg-bg border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="text-label text-primary">Jadwal tryout</div>
                <h2 className="text-h1 text-text">
                  Tryout tiap minggu mulai 2 Nov 2026.
                </h2>
              </div>
              <p className="text-[15px] text-text-body max-w-md">
                Pilih jadwal yang sedang dibuka untuk langsung mulai ngerjain 7 subtes SNBT secara gratis.
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
        <section id="harga" className="py-16 lg:py-24 bg-surface border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="text-label text-primary">Mulai Rp8.900 per tryout</div>
                <h2 className="text-h1 text-text">Bayarnya gimana?</h2>
                <p className="text-[17px] text-text-body">
                  Tryout gratis. Coin cuma buat pembahasan. Makin banyak coin, makin murah per tryout.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                  <span>Tanpa langganan</span>
                </span>
                <span className="h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                  <span>QRIS</span>
                </span>
                <span className="h-7 px-3 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                  <span>Berlaku s.d. 21 Apr 2027</span>
                </span>
              </div>
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

                      {/* Price & Per-Unit Muted Text */}
                      <div className="pt-2 border-t border-ink-100 space-y-1">
                        <div className="text-[28px] font-bold text-text leading-tight tabular-nums">
                          {formatRupiah(pack.totalPrice)}
                        </div>
                        <div className="text-[13px] font-mono text-primary font-semibold tabular-nums">
                          {formatRupiah(pack.perTryout)} per tryout
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

            {/* Formula Block & Payment Terms (WRITING.md §7) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 bg-bg rounded-xl border border-border p-6 space-y-2">
                <div className="text-label text-primary">Rumus harga per tryout</div>
                <div className="font-mono text-[15px] font-bold text-text">
                  Harga per tryout = harga paket ÷ jumlah coin
                </div>
                <div className="font-mono text-[13px] text-text-muted tabular-nums">
                  Contoh: Rp59.000 ÷ 5 = Rp11.800 per tryout
                </div>
              </div>

              <div className="lg:col-span-5 bg-surface-muted rounded-xl border border-border p-6 space-y-3">
                <p className="text-[13px] text-text-body leading-relaxed">
                  1 coin buat 1 pembahasan tryout. Coin yang udah dibeli nggak bisa diuangkan lagi.
                </p>
                <div>
                  <Link
                    href={isLoggedIn ? "/shop" : "/register"}
                    className="text-[14px] font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>{isLoggedIn ? "Beli coin" : "Daftar gratis"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 6. Social Proof & Sample IRT Breakdown — Peserta (WRITING.md §7)   */}
        {/* ================================================================== */}
        <section id="peserta" className="py-16 lg:py-24 bg-bg border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Stats & Target Campuses */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <div className="text-label text-primary">Peserta Jitu</div>
                  <h2 className="text-h1 text-text">
                    300+ siswa dari 14 sekolah.
                  </h2>
                  <p className="text-[17px] text-text-body leading-[1.6]">
                    Dipakai siswa SMA di Jakarta buat persiapan SNBT.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl border border-border p-5 space-y-2">
                    <div className="flex items-center justify-between text-primary">
                      <span className="text-label">Siswa</span>
                      <Users className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                    </div>
                    <div className="text-[34px] font-bold text-text leading-none tabular-nums">
                      300+
                    </div>
                    <p className="text-[13px] text-text-muted">
                      Siswa terdaftar persiapan SNBT
                    </p>
                  </div>

                  <div className="bg-surface rounded-xl border border-border p-5 space-y-2">
                    <div className="flex items-center justify-between text-primary">
                      <span className="text-label">Sekolah</span>
                      <School className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                    </div>
                    <div className="text-[34px] font-bold text-text leading-none tabular-nums">
                      14
                    </div>
                    <p className="text-[13px] text-text-muted">
                      SMA di Jakarta
                    </p>
                  </div>
                </div>

                {/* Target PTN Badges */}
                <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
                  <div className="text-label text-text-muted">
                    Target PTN impian peserta
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 items-center">
                    {TARGET_CAMPUSES.map((campus) => (
                      <div
                        key={campus.name}
                        className="h-14 rounded-lg bg-surface-muted border border-border px-2 flex flex-col items-center justify-center gap-1"
                      >
                        <Image
                          src={campus.src}
                          alt={`Logo ${campus.name}`}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="font-mono text-[10px] font-semibold text-text">
                          {campus.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Real UI Sample of 7-Subtest IRT Score Breakdown */}
              <div className="lg:col-span-7 bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 bg-surface-muted border-b border-ink-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 px-2.5 rounded-full bg-success-soft text-success-text text-[12px] font-semibold inline-flex items-center">
                      Selesai dikerjakan
                    </span>
                    <span className="text-[14px] font-semibold text-text">
                      Contoh rincian hasil Tryout #1
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[12px]">
                    <span className="px-2 py-0.5 rounded bg-success-soft text-success-text font-semibold tabular-nums">
                      Benar 112
                    </span>
                    <span className="px-2 py-0.5 rounded bg-danger-soft text-danger-text font-semibold tabular-nums">
                      Salah 31
                    </span>
                    <span className="px-2 py-0.5 rounded bg-ink-100 text-text-body font-semibold tabular-nums">
                      Kosong 12
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-ink-100">
                    <div>
                      <div className="text-label text-text-muted">Dibuka pakai 1 coin</div>
                      <h3 className="text-h3 text-text mt-0.5">
                        Rincian skor IRT 7 subtes SNBT
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-text-muted">Rata-rata skor IRT</div>
                      <div className="font-mono text-[28px] font-bold text-primary leading-none tabular-nums">
                        648
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {SUBTEST_SAMPLE_SCORES.map((sub) => {
                      const widthPct = Math.min(100, Math.round((sub.score / 800) * 100));
                      return (
                        <div key={sub.code} className="space-y-1">
                          <div className="flex items-baseline justify-between gap-4">
                            <div className="min-w-0">
                              <span className="font-mono text-[13px] font-semibold text-text">
                                {sub.code}
                              </span>
                              <span className="text-[13px] text-text-muted ml-2">
                                {sub.name}
                              </span>
                            </div>
                            <span className="font-mono text-[14px] font-semibold text-text tabular-nums shrink-0">
                              {sub.score}
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sub.barClass}`}
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 7. FAQ (WRITING.md §7)                                             */}
        {/* ================================================================== */}
        <section id="faq" className="py-16 lg:py-24 bg-surface border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <div className="text-label text-primary">FAQ</div>
              <h2 className="text-h1 text-text">
                Pertanyaan yang sering ditanya
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-bg rounded-xl border border-border space-y-2.5">
                <h3 className="text-h3 text-text">Beneran gratis?</h3>
                <p className="text-[14px] text-text-body leading-relaxed">
                  Beneran. Semua tryout gratis dikerjakan, dan jumlah benar, salah, kosongmu langsung keluar. Coin cuma kepakai kalau kamu mau skor IRT dan pembahasan.
                </p>
              </div>

              <div className="p-6 bg-bg rounded-xl border border-border space-y-2.5">
                <h3 className="text-h3 text-text">Coin bisa hangus nggak?</h3>
                <p className="text-[14px] text-text-body leading-relaxed">
                  Berlaku sampai 21 Apr 2027. Selama itu coin bisa dipakai di tryout mana aja.
                </p>
              </div>

              <div className="p-6 bg-bg rounded-xl border border-border space-y-2.5">
                <h3 className="text-h3 text-text">Bayarnya lewat apa?</h3>
                <p className="text-[14px] text-text-body leading-relaxed">
                  QRIS. Pilih paket coin, scan kode QRIS dari aplikasi bank atau e-wallet, dan coin langsung masuk ke akunmu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 8. Closing CTA Band (WRITING.md §7)                                */}
        {/* ================================================================== */}
        <section className="py-16 lg:py-20 bg-bg border-b border-border">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <div className="text-label text-blue-800">
                  2 Nov 2026 · 21 Apr 2027
                </div>
                <h2 className="text-h1 text-text">
                  Tryout #1 dibuka 2 Nov 2026.
                </h2>
                <p className="text-[17px] text-text-body">
                  Daftar dulu, gratis. Pas jadwalnya buka, tinggal kerjain.
                </p>
              </div>

              <div className="w-full sm:w-auto shrink-0">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/register"}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-md bg-primary text-white text-[15px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-pressed transition-colors duration-[120ms] shadow-sm"
                >
                  <span>{isLoggedIn ? "Buka tryout" : "Daftar gratis"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================== */}
      {/* 9. Footer (DESIGN.md §2.1 blue-900)                                */}
      {/* ================================================================== */}
      <footer className="bg-blue-900 text-white py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-blue-800">
            <div className="md:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2.5">
                <Image
                  src="/blue-jitu-logo.png"
                  alt="Logo Jitu"
                  width={48}
                  height={32}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <span className="font-bold text-[24px] tracking-[-0.025em] text-white leading-none">
                  jitu<span className="text-yellow-400">.</span>
                </span>
              </div>
              <p className="text-[14px] text-blue-100 max-w-sm leading-relaxed">
                Tryout SNBT tiap minggu, 2 Nov 2026 sampai 21 Apr 2027. Gratis dikerjakan. Pembahasan mulai Rp8.900 per tryout.
              </p>
              <div className="font-mono text-[12px] text-blue-200">
                jituptn.com
              </div>
            </div>

            {/* Subtest Codes */}
            <div className="md:col-span-4 space-y-3">
              <div className="text-label text-blue-200">Subtes SNBT</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-blue-100">
                {SUBTEST_SAMPLE_SCORES.map((sub) => (
                  <li key={sub.code} className="leading-tight">
                    <span className="font-mono font-semibold text-white">
                      {sub.code}
                    </span>
                    <div className="text-blue-200">{sub.name}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <div className="text-label text-blue-200">Halaman</div>
              <div className="grid grid-cols-1 gap-1.5 text-[14px]">
                <a
                  href="#cara-kerja"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Cara kerja
                </a>
                <a
                  href="#jadwal"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Jadwal
                </a>
                <a
                  href="#harga"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Harga
                </a>
                <a
                  href="#peserta"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Peserta
                </a>
                <Link
                  href="/careers"
                  className="text-yellow-400 font-semibold hover:underline min-h-[32px] inline-flex items-center"
                >
                  Open Hiring 2026
                </Link>
                <Link
                  href="/login"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-blue-100 hover:text-white hover:underline min-h-[32px] inline-flex items-center"
                >
                  Daftar gratis
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-blue-200">
            <span>© 2026 Jitu (jituptn.com).</span>
            <span>
              1 coin berlaku untuk 1 pembahasan tryout. Coin yang udah dibeli nggak bisa diuangkan lagi.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageModule;
