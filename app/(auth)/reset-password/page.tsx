"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionCode = searchParams.get("oobCode");

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
      await resetPassword(password, actionCode!);
      toast.success("Kata sandi berhasil diperbarui. Silakan masuk.");
      router.push("/login");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Tautan atur ulang sudah kedaluwarsa. Minta tautan baru.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!actionCode) {
    return (
      <div className="p-6 space-y-4">
        <div className="p-4 rounded-md border border-danger/30 bg-danger-soft text-danger-text text-[14px] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5 text-danger" aria-hidden="true" />
          <span>Tautan atur ulang tidak ditemukan atau sudah kedaluwarsa.</span>
        </div>
        <Link
          href="/forgot-password"
          className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-colors duration-[120ms]"
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
          className="p-3 rounded-md border border-danger/30 bg-danger-soft text-danger-text text-[14px] flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5 text-danger" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="block text-[14px] font-semibold text-text"
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
            className="absolute right-1 top-1 bottom-1 w-10 rounded-sm inline-flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 stroke-[1.75]" />
            ) : (
              <Eye className="h-4 w-4 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-new-password"
          className="block text-[14px] font-semibold text-text"
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
        className="w-full min-h-[44px] px-4 py-2.5 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-pressed text-on-primary font-semibold text-[15px] inline-flex items-center justify-center gap-2 disabled:bg-blue-300 cursor-pointer transition-colors duration-[120ms]"
      >
        <span>{loading ? "Memproses…" : "Simpan kata sandi"}</span>
        {!loading && <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Kata sandi baru
          </span>
        </div>

        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border bg-surface">
            <h1 className="text-h2 text-text">
              Buat kata sandi baru
            </h1>
            <p className="text-[14px] text-text-muted mt-1">
              Kata sandi minimal 8 karakter.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="p-6 text-[14px] text-text-muted">
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
