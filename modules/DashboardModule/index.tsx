"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Users,
  ArrowRight,
  Check,
  Clock,
  TrendingUp,
  Camera,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subtests } from "./payload";
import { ScoreData } from "./interface";
import { UserWithRole } from "@/lib/types";
import { useSession, refreshSession } from "@/lib/auth-client";
import {
  getUserStats,
  getOngoingTryouts,
  getAvailableTryouts,
  getScoreHistory,
  getCachedDashboardData,
  isDashboardCacheFresh,
  setCachedDashboardData,
  invalidateDashboardCache,
  UserStats,
  OngoingTryout,
  AvailableTryout,
  ScoreHistory,
} from "@/lib/api/DashboardApi";
import { toast } from "sonner";
import { RegisterModal } from "./components/RegisterModal";
import { BACKEND_URL } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScoreHistoryChart = dynamic(
  () => import("./components/ScoreHistoryChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-lg jitu-skeleton" />
    ),
  }
);

/**
 * DESIGN.md Section 2.4 & 5 — Student dashboard
 * Series order:
 * 1. #2557DB (blue-600) — primary series
 * 2. #FFC81F (yellow-400) — comparison / benchmark
 * 3. #93BAFF (blue-300)
 * 4. #6B778C (ink-500)
 * 5. #1F9D63 (success)
 * 6. #1B3475 (blue-900)
 */
const SERIES_BLUES = [
  "#2557DB",
  "#FFC81F",
  "#93BAFF",
  "#6B778C",
  "#1F9D63",
  "#1B3475",
];

const DashboardModule = () => {
  const router = useRouter();
  const [activeSubtests, setActiveSubtests] = useState<string[]>(["total"]);
  const { data: session, isPending } = useSession();
  const cachedInitial = getCachedDashboardData();
  const [userStats, setUserStats] = useState<UserStats | null>(
    cachedInitial?.stats ?? null
  );
  const [ongoingTryouts, setOngoingTryouts] = useState<OngoingTryout[]>(
    cachedInitial?.ongoing ?? []
  );
  const [availableTryoutsData, setAvailableTryoutsData] = useState<
    AvailableTryout[]
  >(cachedInitial?.available ?? []);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>(
    cachedInitial?.history ?? []
  );
  const [loading, setLoading] = useState(!cachedInitial);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<OngoingTryout | null>(
    null
  );
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
      } else if ((session.user as unknown as UserWithRole).role === "ADMIN") {
        router.push("/admin");
      } else if (!isDashboardCacheFresh()) {
        void loadDashboardData(!getCachedDashboardData());
      }
    }
  }, [session, isPending, router]);

  const loadDashboardData = async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const [stats, ongoing, available, history] = await Promise.all([
        getUserStats(),
        getOngoingTryouts(),
        getAvailableTryouts(),
        getScoreHistory(),
      ]);

      setUserStats(stats);
      setOngoingTryouts(ongoing);
      setAvailableTryoutsData(available);
      setScoreHistory(history);
      setCachedDashboardData({ stats, ongoing, available, history });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      if (showSkeleton) {
        toast.error("Gagal memuat data beranda. Coba muat ulang.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (tryout: OngoingTryout) => {
    setSelectedTryout(tryout);
    setRegisterError("");
    setRegisterModalOpen(true);
  };

  const onConfirmRegister = async () => {
    if (!selectedTryout) return;
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const res = await fetch(
        `${BACKEND_URL}/tryout/${selectedTryout.id}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar tryout.");
      }

      toast.success(data.message || "Terdaftar di tryout.");
      setRegisterModalOpen(false);
      invalidateDashboardCache();
      void loadDashboardData(false);
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : "Gagal mendaftar tryout.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/profile`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Gagal mengunggah foto.");

      toast.success("Foto profil diperbarui.");
      await refreshSession();
    } catch {
      toast.error("Gagal mengunggah foto. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-40 rounded-lg jitu-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 rounded-lg jitu-skeleton" />
          <div className="h-32 rounded-lg jitu-skeleton" />
          <div className="h-32 rounded-lg jitu-skeleton" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const toggleSubtest = (id: string) => {
    setActiveSubtests((prev) => {
      if (id === "total") {
        return ["total"];
      }
      const newSubtests = prev.filter((sub) => sub !== "total");
      if (newSubtests.includes(id)) {
        const next = newSubtests.filter((sub) => sub !== id);
        return next.length === 0 ? ["total"] : next;
      }
      return [...newSubtests, id];
    });
  };

  const chartData = {
    labels: scoreHistory.map((score) => score.to),
    datasets: subtests
      .filter(
        (subtest) =>
          activeSubtests.includes(subtest.id) ||
          activeSubtests.includes("total")
      )
      .map((subtest, idx) => {
        const stroke = SERIES_BLUES[idx % SERIES_BLUES.length];
        return {
          label: subtest.label,
          data: scoreHistory.map(
            (score) => Number(score[subtest.id as keyof ScoreData]) || 0
          ),
          borderColor: stroke,
          backgroundColor: stroke,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: stroke,
          pointBorderWidth: 2,
          fill: false,
          tension: 0,
        };
      }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#E9EDF4",
        },
        ticks: {
          color: "#6B778C",
          font: { size: 12 },
        },
      },
      x: {
        grid: {
          color: "#E9EDF4",
        },
        ticks: {
          color: "#6B778C",
          font: { size: 12 },
        },
      },
    },
  };

  const myTryouts = ongoingTryouts.filter((t) => t.isRegistered);
  const marketTryouts = [
    ...ongoingTryouts.filter((t) => !t.isRegistered),
    ...availableTryoutsData.filter(
      (at) => !ongoingTryouts.some((ot) => ot.id === at.id)
    ),
  ];

  // Primary featured tryout for Top Banner
  const featuredTryout =
    myTryouts.find((t) => t.status !== "FINISHED") ||
    myTryouts[0] ||
    marketTryouts[0] ||
    null;

  const avgScore =
    scoreHistory.length > 0
      ? Math.round(
          scoreHistory.reduce((acc, curr) => acc + curr.total, 0) /
            scoreHistory.length
        )
      : null;

  const formatSlotDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "16 Nov 2026";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 1. Student Identity Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar
              className="w-14 h-14 border border-border cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-surface-muted text-text font-semibold text-[16px]">
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
              {isUploading ? (
                <div className="absolute inset-0 bg-[#121F47]/60 flex items-center justify-center rounded-full">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#121F47]/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <div className="text-label text-text-muted">
              Lembar peserta · SNBT 2026
            </div>
            <h1 className="text-h2 text-text">
              {session.user.name}
            </h1>
          </div>
        </div>

        {/* Summary Numbers Row */}
        <div className="grid grid-cols-3 rounded-lg border border-border bg-surface divide-x divide-ink-100">
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              Terdaftar
            </div>
            <div className="font-mono font-bold text-[20px] text-text tabular-nums">
              {myTryouts.length}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              Selesai
            </div>
            <div className="font-mono font-bold text-[20px] text-text tabular-nums">
              {userStats?.totalFinished ?? 0}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              Rerata IRT
            </div>
            <div className="font-mono font-bold text-[20px] text-primary tabular-nums">
              {avgScore ?? "-"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP: Next Tryout */}
      <section aria-label="Tryout berikutnya">
        {featuredTryout ? (
          <div className="bg-surface rounded-lg border border-border p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-blue-300 transition-colors duration-[120ms]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-[12px] font-semibold inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
                  <span>
                    {featuredTryout.isRegistered
                      ? featuredTryout.status === "IN_PROGRESS"
                        ? "Sedang dikerjakan"
                        : featuredTryout.status === "FINISHED"
                          ? "Selesai"
                          : "Siap dikerjakan"
                      : "Jadwal terdekat"}
                  </span>
                </span>
                <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold inline-flex items-center gap-1.5">
                  <PixelCoin size={14} />
                  <span>Gratis dikerjakan · Pembahasan {featuredTryout.solutionPrice || 1} coin</span>
                </span>
              </div>

              <div className="font-bold text-[32px] sm:text-[36px] leading-tight tracking-[-0.02em] text-text tabular-nums">
                {formatSlotDate(featuredTryout.scheduledStart)}
              </div>

              <h2 className="text-h3 text-text">
                {featuredTryout.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-text-muted font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                  <span className="tabular-nums">{featuredTryout.participants} peserta</span>
                </span>
                <span>·</span>
                <span>7 subtes SNBT</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 min-w-[200px]">
              {featuredTryout.isRegistered ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => router.push(`/tryout/${featuredTryout.id}`)}
                  className="justify-between"
                >
                  <span>
                    {featuredTryout.status === "FINISHED"
                      ? "Lihat hasil"
                      : "Kerjakan"}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() =>
                    handleRegisterClick(featuredTryout as OngoingTryout)
                  }
                  className="justify-between"
                >
                  <span>Daftar gratis</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-lg border border-dashed border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[15px] text-text-body">
              Belum ada tryout yang kamu kerjakan. Tryout #1 dibuka 16 Nov.
            </p>
            <Button onClick={() => router.push("/tryout")}>Lihat jadwal</Button>
          </div>
        )}
      </section>

      {/* 2b. Bank Soal Asli UTBK (2010 - 2026) Highlight Card */}
      <section aria-label="Bank Soal Asli UTBK">
        <div className="bg-surface rounded-xl border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-300 transition-colors shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-bold inline-flex items-center gap-1.5 border border-blue-200">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Naskah Ujian Asli</span>
              </span>
              <span className="h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-800 text-[12px] font-semibold border border-yellow-200">
                163 Paket · 2010 – 2026
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-text">
              Arsip Soal Asli UTBK & SNBT
            </h2>
            <p className="text-[14px] text-text-body max-w-2xl leading-relaxed">
              Pelajari dan latih kemampuanmu langsung dari naskah asli ujian tahun-tahun sebelumnya. Lengkap dengan lembar jawab digital, timer simulasi 30 menit, dan arsip 7 subtes.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/soal-asli"
              className="min-h-[44px] px-5 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-pressed text-white text-[14px] font-semibold inline-flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Buka Soal Asli</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MIDDLE: Tryout Schedule Grid & Tabs */}
      <section className="space-y-6">
        <Tabs defaultValue="my-tryouts" className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="my-tryouts">
                <span>Tryout kamu</span>
                <span className="h-5 px-2 rounded-full bg-ink-100 font-mono text-[11px] font-semibold tabular-nums text-text inline-flex items-center">
                  {myTryouts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="explore" id="explore-trigger">
                <span>Jadwal tersedia</span>
                <span className="h-5 px-2 rounded-full bg-ink-100 font-mono text-[11px] font-semibold tabular-nums text-text inline-flex items-center">
                  {marketTryouts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <span>Grafik skor</span>
              </TabsTrigger>
            </TabsList>

            <Link
              href="/tryout"
              className="text-[13px] font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
            >
              <span>Buka semua jadwal</span>
              <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
            </Link>
          </div>

          {/* TAB 1: MY TRYOUTS */}
          <TabsContent value="my-tryouts">
            {myTryouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTryouts.map((tryout, idx) => {
                  const isFinished = tryout.status === "FINISHED";
                  const isProgress = tryout.status === "IN_PROGRESS";

                  return (
                    <article
                      key={tryout.id}
                      className={`p-6 rounded-lg border border-border flex flex-col justify-between gap-4 hover:border-blue-300 transition-colors duration-[120ms] ${
                        isFinished ? "bg-surface-muted" : "bg-surface"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-label text-text-muted tabular-nums">
                            Tryout #{idx + 1}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold ${
                              isFinished
                                ? "bg-success-soft text-success-text"
                                : isProgress
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-50 text-blue-800"
                            }`}
                          >
                            {isFinished ? (
                              <Check className="w-3.5 h-3.5 stroke-[1.75]" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
                            )}
                            <span>
                              {isFinished
                                ? "Selesai"
                                : isProgress
                                  ? "Berjalan"
                                  : "Terdaftar"}
                            </span>
                          </span>
                        </div>

                        <div className="font-bold text-[28px] leading-tight tracking-[-0.02em] text-text tabular-nums">
                          {formatSlotDate(tryout.scheduledStart)}
                        </div>

                        <div className="pt-3 border-t border-ink-100 space-y-1">
                          <h3 className="text-[16px] font-semibold text-text leading-snug">
                            {tryout.title}
                          </h3>
                          <p className="text-[13px] text-text-muted tabular-nums">
                            {tryout.participants} peserta · SNBT
                          </p>
                        </div>
                      </div>

                      <Button
                        variant={isFinished ? "outline" : "primary"}
                        className="w-full justify-between"
                        onClick={() => router.push(`/tryout/${tryout.id}`)}
                      >
                        <span>
                          {isFinished
                            ? "Lihat hasil"
                            : isProgress
                              ? "Lanjutkan"
                              : "Kerjakan"}
                        </span>
                        <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                      </Button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-lg border border-dashed border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[15px] text-text-body">
                  Belum ada tryout yang dikerjakan. Tryout #1 dibuka 16 Nov 2026.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("explore-trigger")?.click()
                  }
                >
                  Pilih jadwal
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: EXPLORE */}
          <TabsContent value="explore">
            {marketTryouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketTryouts.map((tryout, idx) => (
                  <article
                    key={tryout.id}
                    className="p-6 bg-surface rounded-lg border border-border flex flex-col justify-between gap-4 hover:border-blue-300 transition-colors duration-[120ms]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-label text-text-muted tabular-nums">
                          Tryout #{tryout.title.match(/\d+/)?.[0] || idx + 1}
                        </span>
                        <span className="h-6 px-2.5 rounded-full bg-blue-50 text-blue-800 text-[12px] font-semibold inline-flex items-center">
                          Gratis · Rp0
                        </span>
                      </div>

                      <div className="font-bold text-[28px] leading-tight tracking-[-0.02em] text-text tabular-nums">
                        {formatSlotDate(tryout.scheduledStart)}
                      </div>

                      <div className="pt-3 border-t border-ink-100 space-y-1">
                        <h3 className="text-[16px] font-semibold text-text leading-snug">
                          {tryout.title}
                        </h3>
                        <p className="text-[13px] text-text-muted tabular-nums">
                          {tryout.participants} peserta · Pembahasan{" "}
                          {tryout.solutionPrice || 1} coin
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() =>
                        handleRegisterClick(tryout as OngoingTryout)
                      }
                    >
                      <span>Daftar gratis</span>
                      <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                    </Button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-lg border border-dashed border-border bg-surface-muted">
                <p className="text-[15px] text-text-body">
                  Semua jadwal yang tersedia sudah terdaftar di akunmu.
                </p>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: SCORE HISTORY */}
          <TabsContent value="history">
            <div className="bg-surface rounded-lg border border-border p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
                <div>
                  <div className="text-label text-text-muted">
                    Perkembangan nilai IRT
                  </div>
                  <h3 className="text-h3 text-text">
                    Grafik skor
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSubtest("total")}
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer transition-colors duration-[120ms] ${
                      activeSubtests.includes("total")
                        ? "bg-primary text-on-primary"
                        : "bg-surface-muted text-text-body border border-border hover:text-text"
                    }`}
                  >
                    Total
                  </button>
                  {subtests.map((subtest) => (
                    <button
                      key={subtest.id}
                      type="button"
                      onClick={() => toggleSubtest(subtest.id)}
                      className={`h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer transition-colors duration-[120ms] ${
                        activeSubtests.includes(subtest.id)
                          ? "bg-primary text-on-primary"
                          : "bg-surface-muted text-text-body border border-border hover:text-text"
                      }`}
                    >
                      {subtest.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[340px] w-full">
                {scoreHistory.length > 0 ? (
                  <ScoreHistoryChart data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full rounded-lg border border-dashed border-border bg-surface-muted flex flex-col items-center justify-center p-6 text-center gap-3">
                    <TrendingUp className="w-8 h-8 stroke-[1.75] text-text-muted" />
                    <p className="text-[14px] text-text-body">
                      Belum ada tryout yang dikerjakan. Grafik skor muncul setelah kamu menyelesaikan tryout.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>



      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={selectedTryout?.title || ""}
        tokenCost={selectedTryout?.solutionPrice || 0}
        isLoading={registerLoading}
        error={registerError}
      />
    </div>
  );
};

export default DashboardModule;
