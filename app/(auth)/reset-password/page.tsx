"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Kata sandi konfirmasi belum sama.");
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword(
        {
          newPassword: password,
        },
        {
          onSuccess: () => {
            toast.success("Kata sandi berhasil diperbarui. Silakan masuk.");
            router.push("/login");
          },
          onError: (ctx: { error?: { message?: string } }) => {
            const msg =
              ctx?.error?.message ||
              "Tautan atur ulang sudah kedaluwarsa. Minta tautan baru.";
            setErrorMsg(msg);
            toast.error(msg);
          },
        }
      );
    } catch {
      setErrorMsg("Gagal menyimpan kata sandi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 space-y-4">
        <div className="p-4 border-2 border-warn bg-warn-100 text-warn text-[14px] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5" aria-hidden="true" />
          <span>Tautan atur ulang tidak ditemukan atau sudah kedaluwarsa.</span>
        </div>
        <Link
          href="/forgot-password"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[15px] inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span>Minta tautan baru</span>
          <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
      {errorMsg && (
        <div
          role="alert"
          className="p-3 border border-red-300 bg-red-50 text-red-900 text-[14px] flex items-start gap-2.5 shadow-xs"
        >
          <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="block text-[14px] font-semibold text-blue-900"
        >
          Kata sandi baru
        </label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            className="pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1 bottom-1 w-10 inline-flex items-center justify-center text-slate-700 hover:text-blue-900 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 stroke-[1.75]" />
            ) : (
              <Eye className="h-5 w-5 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-new-password"
          className="block text-[14px] font-semibold text-blue-900"
        >
          Ulangi kata sandi baru
        </label>
        <Input
          id="confirm-new-password"
          type={showPassword ? "text" : "password"}
          placeholder="Ketik ulang kata sandi"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[15px] inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs transition-colors"
      >
        <span>{loading ? "Memproses…" : "Simpan kata sandi"}</span>
        {!loading && <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 flex flex-col items-center justify-center">
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
            <span className="font-display font-extrabold text-[24px] tracking-[-0.025em] text-slate-900 leading-none">
              jitu<span className="text-blue-600">.</span>
            </span>
          </Link>
          <span className="px-2 py-[3px] border border-slate-300 bg-white font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700 shadow-xs">
            KATA SANDI BARU
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 shadow-lg">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white">
            <h1 className="font-display font-extrabold text-[26px] leading-[1.05] tracking-[-0.025em]">
              Buat kata sandi baru
            </h1>
            <p className="text-[14px] text-slate-300 mt-1">
              Kata sandi minimal 8 karakter.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="p-6 font-mono text-[14px] text-slate-700">
                Memuat formulir…
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}