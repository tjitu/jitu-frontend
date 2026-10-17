"use client";

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { RegisterData } from "./interface";
import { signUp, signIn } from "@/lib/auth-client";

/**
 * DESIGN.md Section 6.2 — Auth (Sign up)
 * Single 420px column, white card, centered.
 * Sign up: name, email or WhatsApp, password, school.
 * Inline per-field errors; password has show/hide. One signal CTA per screen.
 */
const RegisterModule = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    school?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
  });

  const handleChange = (field: keyof RegisterData, value: string) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!registerData.name.trim()) {
      nextErrors.name = "Tulis nama lengkapmu.";
    }
    if (!registerData.email.trim()) {
      nextErrors.email = "Masukkan email aktif.";
    }
    if (registerData.password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }
    if (
      registerData.confirmPassword &&
      registerData.password !== registerData.confirmPassword
    ) {
      nextErrors.confirmPassword = "Kata sandi konfirmasi belum sama.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    await signUp.email(
      {
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
      },
      {
        onSuccess: () => {
          setLoading(false);
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setLoading(false);
          const msg = ctx.error.message || "Gagal membuat akun. Coba lagi.";
          setErrors({ form: msg });
          toast.error(msg);
        },
      }
    );
  };

  const handleGoogleRegister = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Top Brand Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Beranda Jitu"
            className="min-h-[44px] inline-flex items-center gap-2.5 focus:outline-3 focus:outline-blue-500 focus:outline-offset-2"
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
            DAFTAR GRATIS
          </span>
        </div>

        {/* Single 420px White Card */}
        <div className="bg-white border-2 border-blue-900 shadow-[10px_10px_0_var(--blue-500)]">
          <div className="px-6 py-4 border-b-2 border-blue-900 bg-blue-800 text-white">
            <h1 className="font-display font-extrabold text-[28px] leading-[1.05] tracking-[-0.025em]">
              Buat akun peserta
            </h1>
            <p className="text-[14px] text-blue-200 mt-1">
              Semua jadwal tryout gratis dikerjakan. Tanpa biaya pendaftaran.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            {errors.form && (
              <div
                role="alert"
                className="p-3 border-2 border-warn bg-warn-100 text-warn text-[14px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-[14px] font-semibold text-blue-900"
              >
                Nama lengkap
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Nama sesuai kartu pelajar"
                value={registerData.name}
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-[13px] text-warn flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email or WhatsApp */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[14px] font-semibold text-blue-900"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={registerData.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-[13px] text-warn flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* School (DESIGN.md Section 6.2: Sign up: name, email or WhatsApp, password, school) */}
            <div className="space-y-1.5">
              <label
                htmlFor="school"
                className="block text-[14px] font-semibold text-blue-900"
              >
                Asal SMA / SMK
              </label>
              <Input
                id="school"
                type="text"
                placeholder="Contoh: SMAN 8 Jakarta"
                value={registerData.school || ""}
                onChange={(e) => handleChange("school", e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[14px] font-semibold text-blue-900"
              >
                Kata sandi
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={registerData.password}
                  aria-invalid={Boolean(errors.password)}
                  onChange={(e) => {
                    handleChange("password", e.target.value);
                    handleChange("confirmPassword", e.target.value);
                  }}
                  className="pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 bottom-1 w-10 inline-flex items-center justify-center text-slate-700 hover:text-blue-900 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-[13px] text-warn flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                  <span>{errors.password}</span>
                </p>
              ) : (
                <p className="text-[13px] text-slate-700">
                  Kata sandi minimal 8 karakter.
                </p>
              )}
            </div>

            {/* Primary Signal CTA */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full jitu-btn-primary text-[16px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? "Memproses…" : "Daftar gratis"}</span>
                {!loading && <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />}
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white font-mono text-[11px] uppercase tracking-[0.06em] text-slate-700">
                  ATAU
                </span>
              </div>
            </div>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full jitu-btn-secondary bg-white text-[14px] font-semibold inline-flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Image
                src="/icons/google.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>Daftar dengan Google</span>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="px-6 py-4 border-t border-slate-300 bg-blue-50 text-center text-[14px] text-slate-700">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-500 hover:underline"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModule;
