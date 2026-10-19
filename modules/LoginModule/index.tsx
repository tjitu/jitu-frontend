"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LoginData } from "./interface";
import { signIn, useSession } from "@/lib/auth-client";
import { UserWithRole } from "@/lib/types";

/**
 * DESIGN.md Section 6.2 — Auth (Log in)
 * Single 420px column, white card, centered.
 * Inline per-field errors; password has show/hide. One signal CTA per screen.
 */
const LoginModule = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      if ((session.user as unknown as UserWithRole).role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleChange = (field: keyof LoginData, value: string) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nextErrors: { email?: string; password?: string } = {};
    if (!loginData.email.trim()) {
      nextErrors.email = "Masukkan alamat email akunmu.";
    }
    if (!loginData.password) {
      nextErrors.password = "Masukkan kata sandi akunmu.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    await signIn.email(
      {
        email: loginData.email,
        password: loginData.password,
      },
      {
        onSuccess: (ctx) => {
          setLoading(false);
          const user = ctx.data.user as unknown as UserWithRole;
          if (user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        },
        onError: (ctx) => {
          setLoading(false);
          const msg =
            ctx.error.message || "Email atau kata sandi salah.";
          setErrors({ form: msg });
          toast.error(msg);
        },
      }
    );
  };

  const handleGoogleLogin = async () => {
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
            MASUK AKUN
          </span>
        </div>

        {/* Single 420px White Card */}
        <div className="bg-white border-2 border-blue-900 shadow-[10px_10px_0_var(--blue-500)]">
          <div className="px-6 py-4 border-b-2 border-blue-900 bg-blue-800 text-white">
            <h1 className="font-display font-extrabold text-[28px] leading-[1.05] tracking-[-0.025em]">
              Masuk ke Jitu
            </h1>
            <p className="text-[14px] text-blue-200 mt-1">
              Lanjutkan tryout atau buka pembahasan yang sudah kamu kerjakan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            {errors.form && (
              <div
                role="alert"
                className="p-3 border-2 border-warn bg-warn-100 text-warn text-[14px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 stroke-[1.75] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Email Input */}
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
                placeholder="nama@sekolah.sch.id"
                value={loginData.email}
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

            {/* Password Input with Show/Hide */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[14px] font-semibold text-blue-900"
                >
                  Kata sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-semibold text-blue-500 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={loginData.password}
                  aria-invalid={Boolean(errors.password)}
                  onChange={(e) => handleChange("password", e.target.value)}
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
              {errors.password && (
                <p className="text-[13px] text-warn flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-4 h-4 stroke-[1.75] shrink-0" aria-hidden="true" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Primary Signal CTA (One signal CTA per screen) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full jitu-btn-primary text-[16px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? "Memproses…" : "Masuk"}</span>
              {!loading && <ArrowRight className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />}
            </button>

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

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full jitu-btn-secondary bg-white text-[14px] font-semibold inline-flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Image
                src="/icons/google.svg"
                alt=""
                width={18}
                height={18}
              />
              <span>Masuk dengan Google</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="px-6 py-4 border-t border-slate-300 bg-blue-50 text-center text-[14px] text-slate-700">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-500 hover:underline"
            >
              Daftar gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModule;
