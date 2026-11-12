"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import SoalAsliSection from "@/components/soal-asli-section";

/**
 * Landing-page template view for /arsip-soal?from=landing.
 * Preserves Landing Page navigation bar, speckled paper background, and editorial header.
 */
export default function ArsipSoalLandingView() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#jadwal", label: "Tryout" },
    { href: "/arsip-soal?from=landing", label: "Soal Asli", active: true },
    { href: "/#belajar", label: "Belajar" },
    { href: "/#latihan", label: "Latihan" },
    { href: "/blog", label: "Blog" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-yellow-300 selection:text-ink-900 relative flex flex-col">
      {/* Speckled Paper Texture Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url('/white-speckled-paper.svg')] opacity-60 bg-repeat bg-[length:450px_450px] pointer-events-none z-0"
      />

      {/* Landing Page Sticky Header */}
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
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-[38px] px-3.5 rounded-md inline-flex items-center text-[14px] transition-colors duration-[120ms] ${
                  item.active
                    ? "text-blue-700 bg-blue-50 font-semibold"
                    : "font-medium text-text-body hover:text-text hover:bg-surface-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Actions (Matches LandingNav) */}
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
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[44px] px-3 rounded-md inline-flex items-center justify-between text-[15px] transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "font-medium text-text hover:bg-surface-muted"
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] text-text-muted" aria-hidden="true" />
                </Link>
              ))}
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
                    className="min-h-[44px] px-4 py-2.5 rounded-md border border-border bg-surface text-text text-[14px] font-semibold inline-flex items-center justify-center"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="min-h-[44px] px-4 py-2.5 rounded-full bg-yellow-400 text-ink-900 text-[14px] font-bold inline-flex items-center justify-center"
                  >
                    Daftar gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Landing Page Archive Body */}
      <div className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24 space-y-10">
        <SoalAsliSection variant="page" />
      </div>
    </div>
  );
}
