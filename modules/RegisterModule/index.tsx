"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { RegisterData } from "./interface";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const RegisterModule = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setRegisterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (registerData.password != registerData.confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    await signUp.email(
      {
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      }
    );
  };

  const handleGoogleRegister = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
    });
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative h-12 mb-6">
            <Image
              src="/jitu-logo.png"
              alt="title"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Mulai Petualangan Barumu!
          </h2>
          <p className="text-gray-500 text-sm">
            Buat akun gratis dan segera tingkatkan kemampuanmu.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-semibold text-primary-400 mb-2"
              >
                Nama Lengkap
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nama lengkap"
                  value={registerData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-primary-400 mb-2"
              >
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email Kamu"
                  value={registerData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-primary-400 mb-2"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirm-password"
                className="text-sm font-semibold text-primary-400 mb-2"
              >
                Konfirmasi Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Konfirmasi password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <Button onClick={handleSubmit} className="w-full">
              Daftar
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Akses Cepat</span>
              </div>
            </div>

            {/* Google Register Button */}
            <Button
              onClick={handleGoogleRegister}
              variant={"outline"}
              className="w-full"
            >
              <Image
                src="/icons/google.svg"
                alt="google"
                width={20}
                height={20}
              />
              Masuk dengan Google
            </Button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?{" "}
            <a
              href="login"
              className="text-primary-300 font-medium hover:underline"
            >
              Masuk Sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModule;
