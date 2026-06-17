"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { LoginData } from "./interface";
import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserWithRole } from "@/lib/types";
import Link from "next/link";

const LoginModule = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect jika sudah login
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

  const handleChange = (field: string, value: string) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await signIn.email(
      {
        email: loginData.email,
        password: loginData.password,
      },
      {
        onSuccess: (ctx) => {
          const user = ctx.data.user as unknown as UserWithRole;
          if (user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Gagal masuk. Cek email dan password.",
          );
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}` + "/dashboard",
    });
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative h-12 mb-6">
            <Image
              src="/jitu-logo.png"
              alt="logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Siap Belajar Lagi?
          </h2>
          <p className="text-gray-500 text-sm">
            Masuk dan temukan kemajuan yang sudah kamu raih.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border">
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-primary-400 mb-2 block"
              >
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Kamu"
                  value={loginData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-primary-400 mb-2 block"
              >
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10"
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

            {/* Forgot Password */}

            <div className="text-right">
              <Link href={"/forgot-password"}>
                <button
                  type="button"
                  className="text-sm text-primary-300 hover:underline"
                >
                  Lupa password?
                </button>
              </Link>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleSubmit}
              className="w-full font-bold py-6 rounded-xl"
            >
              Masuk
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Akses Cepat
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              variant={"outline"}
              className="w-full py-6 rounded-xl gap-3 font-semibold border-gray-200 hover:bg-gray-50 transition-all"
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

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModule;
