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
    <div className="min-h-screen bg-blue-50 text-blue-900 py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Beranda Jitu"
            className="min-h-[44px] inline-flex items-center gap-2.5"
          >
            <Image
              src="/blue-jitu-logo.png"
              alt="Logo Jitu"
              width={48}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="font-display font-extrabold text-[24px] tracking-[-0.025em] text-blue-900 leading-none">
              jitu<span className="text-blue-500">.</span>
            </span>
          </Link>
          <span className="px-2 py-[3px] border-[1.5px] border-blue-900 bg-white font-mono text-[12px] uppercase tracking-[0.06em] text-blue-900">
            PEMULIHAN AKUN
          </span>
        </div>

        <div className="bg-white border-2 border-blue-900 shadow-[10px_10px_0_var(--blue-500)]">
          <div className="px-6 py-4 border-b-2 border-blue-900 bg-blue-800 text-white">
            <h1 className="font-display font-extrabold text-[28px] leading-[1.05] tracking-[-0.025em]">
              Lupa kata sandi?
            </h1>
            <p className="text-[14px] text-blue-200 mt-1">
              Kami kirim tautan untuk membuat kata sandi baru ke emailmu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            {errorMsg && (
              <div
                role="alert"
                className="p-3 border-2 border-warn bg-warn-100 text-warn text-[14px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sent && (
              <div className="p-3 border-2 border-blue-900 bg-signal-100 text-blue-900 text-[14px] flex items-start gap-2.5">
                <Check className="w-5 h-5 stroke-[1.75] text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Tautan sudah dikirim ke <strong>{email}</strong>. Cek kotak masuk atau folder spam.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[14px] font-semibold text-blue-900"
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
              className="w-full jitu-btn-primary text-[16px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? "Memproses…" : "Kirim tautan"}</span>
              {!loading && <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />}
            </button>
          </form>

          <div className="px-6 py-4 border-t border-slate-300 bg-blue-50">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue-900 hover:underline"
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
