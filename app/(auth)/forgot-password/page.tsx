"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * DESIGN.md Section 6.2 — Auth (Forgot password)
 * Single 420px column, white card, centered. One signal CTA per screen.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Masukkan email akunmu terlebih dulu.");
      return;
    }

    setLoading(true);
    const { error } = await requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      const msg = error.message || "Gagal mengirim tautan. Coba lagi.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSent(true);
    toast.success("Tautan atur ulang kata sandi dikirim ke emailmu.");
  };

  return (
    <div className="min-h-screen bg-bg text-text-body py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex items-center justify-between">
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
            <span className="font-bold text-[24px] tracking-[-0.025em] text-text leading-none">
              jitu<span className="text-primary">.</span>
            </span>
          </Link>
          <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold inline-flex items-center">
            Pemulihan akun
          </span>
        </div>

        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border bg-surface">
            <h1 className="text-h2 text-text">
              Lupa kata sandi?
            </h1>
            <p className="text-[14px] text-text-muted mt-1">
              Kami kirim tautan untuk membuat kata sandi baru ke emailmu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            {errorMsg && (
              <div
                role="alert"
                className="p-3 rounded-md border border-danger/30 bg-danger-soft text-danger-text text-[14px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5 text-danger" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sent && (
              <div className="p-3 rounded-md border border-success/30 bg-success-soft text-success-text text-[14px] flex items-start gap-2.5">
                <Check className="w-5 h-5 stroke-[1.75] text-success shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Tautan sudah dikirim ke <strong>{email}</strong>. Cek kotak masuk atau folder spam.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[14px] font-semibold text-text"
              >
                Email terdaftar
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-primary text-on-primary font-semibold text-[15px] inline-flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-pressed disabled:bg-blue-300 cursor-pointer transition-colors duration-[120ms]"
            >
              <span>{loading ? "Memproses…" : "Kirim tautan"}</span>
              {!loading && <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />}
            </button>
          </form>

          <div className="px-6 py-4 border-t border-border bg-surface-muted">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
              <span>Kembali ke halaman masuk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
