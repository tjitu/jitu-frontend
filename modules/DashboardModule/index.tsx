"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Users,
  ArrowRight,
  Check,
  Clock,
  TrendingUp,
  Loader2,
  BookOpen,
  Calendar,
  Flame,
  Target,
  Sparkles,
  FileText,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { PixelCoin } from "@/components/ui/pixel-coin";
import { subtests } from "./payload";
import { ScoreData } from "./interface";
import { UserWithRole } from "@/lib/types";
import { useSession, refreshSession } from "@/lib/auth-client";
import { getPtnTargetSummary } from "@/lib/target";
import {
  getUserStats,
  getOngoingTryouts,
  getAvailableTryouts,
  getScoreHistory,
  getDailyQuestionStatus,
  getLatestDashboardArticles,
  getCachedDashboardData,
  isDashboardCacheFresh,
  setCachedDashboardData,
  invalidateDashboardCache,
  UserStats,
  OngoingTryout,
  AvailableTryout,
  ScoreHistory,
  DailyQuestionStatus,
  DashboardArticleSummary,
} from "@/lib/api/DashboardApi";
import { toast } from "sonner";
import { RegisterModal } from "./components/RegisterModal";
import { invalidateTryoutCatalogCache } from "../TryoutModule";
import { BACKEND_URL } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TryoutCardBanner } from "@/components/ui/tryout-card-banner";
import { TryoutScheduleTimeline } from "@/components/ui/tryout-schedule-timeline";
import {
  formatTryoutDateRange,
  formatTryoutScheduleDetails,
  getDisplayedParticipants,
} from "@/lib/tryout-display";
import { HotQuestionsCard } from "./components/HotQuestionsCard";
import { MilestoneCard } from "./components/MilestoneCard";
import { AvatarPickerModal } from "../ProfileModule/components/AvatarPickerModal";
import { getStudentAvatarUrl } from "@/lib/avatar";

const ScoreHistoryChart = dynamic(
  () => import("./components/ScoreHistoryChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-lg jitu-skeleton" />
    ),
  }
);

const SERIES_BLUES = [
  "#2557DB",
  "#FFC81F",
  "#93BAFF",
  "#6B778C",
  "#1F9D63",
  "#1B3475",
];

const SUBTEST_LABELS: Array<{ key: keyof Omit<ScoreHistory, "to" | "total">; label: string }> = [
  { key: "pu", label: "Penalaran Umum" },
  { key: "ppu", label: "PPU" },
  { key: "pbm", label: "Pemahaman Bacaan & Menulis" },
  { key: "pk", label: "Pengetahuan Kuantitatif" },
  { key: "lbi", label: "Literasi Indonesia" },
  { key: "lbe", label: "Literasi Inggris" },
  { key: "pm", label: "Penalaran Matematika" },
];

const getSubtestInsights = (scoreHistory: ScoreHistory[]) => {
  if (scoreHistory.length === 0) return null;
  const latest = scoreHistory[scoreHistory.length - 1];
  const entries = SUBTEST_LABELS.map((item) => ({
    label: item.label,
    score: Number(latest[item.key]) || 0,
  })).filter((item) => item.score > 0);

  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  return {
    tryoutLabel: latest.to,
    total: latest.total,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
};

const stripHtml = (raw?: string | null) =>
  (raw || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

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
  const [dailyStatus, setDailyStatus] = useState<DailyQuestionStatus | null>(
    cachedInitial?.dailyStatus ?? null
  );
  const [articles, setArticles] = useState<DashboardArticleSummary[]>(
    cachedInitial?.articles ?? []
  );
  const [loading, setLoading] = useState(!cachedInitial);

  const [scheduleTab, setScheduleTab] = useState<"my-tryouts" | "explore" | "history">(
    (cachedInitial?.ongoing?.some((t) => t.isRegistered) ?? false)
      ? "my-tryouts"
      : "explore"
  );
  const tabManuallyChanged = useRef(false);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<OngoingTryout | null>(
    null
  );
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const handleSaveAvatar = async (avatarUrl: string) => {
    setIsAvatarSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengubah avatar.");

      toast.success("Avatar berhasil diperbarui.");
      await refreshSession();
    } catch {
      toast.error("Gagal mengubah avatar.");
    } finally {
      setIsAvatarSaving(false);
    }
  };

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
      const [stats, ongoing, available, history, daily, latestArticles] =
        await Promise.all([
          getUserStats(),
          getOngoingTryouts(),
          getAvailableTryouts(),
          getScoreHistory(),
          getDailyQuestionStatus(),
          getLatestDashboardArticles(3),
        ]);

      setUserStats(stats);
      setOngoingTryouts(ongoing);
      setAvailableTryoutsData(available);
      setScoreHistory(history);
      setDailyStatus(daily);
      setArticles(latestArticles);

      if (!tabManuallyChanged.current) {
        setScheduleTab(
          ongoing.some((t) => t.isRegistered) ? "my-tryouts" : "explore"
        );
      }

      setCachedDashboardData({
        stats,
        ongoing,
        available,
        history,
        dailyStatus: daily,
        articles: latestArticles,
      });
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
      invalidateTryoutCatalogCache();
      void loadDashboardData(false);
    } catch (err: unknown) {
      setRegisterError(
        err instanceof Error ? err.message : "Gagal mendaftar tryout."
      );
    } finally {
      setRegisterLoading(false);
    }
  };



  if (isPending || loading) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="h-24 rounded-lg jitu-skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-72 rounded-lg jitu-skeleton" />
          <div className="lg:col-span-5 h-72 rounded-lg jitu-skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 rounded-lg jitu-skeleton" />
          <div className="h-28 rounded-lg jitu-skeleton" />
          <div className="h-28 rounded-lg jitu-skeleton" />
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
  const marketTryouts: OngoingTryout[] = [
    ...ongoingTryouts.filter((t) => !t.isRegistered),
    ...availableTryoutsData
      .filter((at) => !ongoingTryouts.some((ot) => ot.id === at.id))
      .map((at) => ({
        ...at,
        isRegistered: false,
        status: "NOT_STARTED",
      })),
  ];

  const featuredTryout =
    marketTryouts[0] ||
    myTryouts.find((t) => t.status === "IN_PROGRESS") ||
    myTryouts.find((t) => t.status !== "FINISHED") ||
    myTryouts[0] ||
    null;

  const avgScore =
    scoreHistory.length > 0
      ? Math.round(
          scoreHistory.reduce((acc, curr) => acc + curr.total, 0) /
            scoreHistory.length
        )
      : null;

  const bestScore =
    userStats?.personalBest && userStats.personalBest > 0
      ? userStats.personalBest
      : avgScore;

  const effectiveStreak =
    userStats?.currentStreak ?? dailyStatus?.streak ?? 0;

  const solvedQuestions = userStats?.solvedQuestions ?? 0;

  const tokenBalance =
    userStats?.tokenBalance ?? session.user.tokenBalance ?? 0;

  const firstName = session.user.name.trim().split(/\s+/)[0] || "Pejuang PTN";
  const subtestInsights = getSubtestInsights(scoreHistory);
  const dailyQuestionSnippet = stripHtml(dailyStatus?.question?.content);

  const formatSlotDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "16 Nov 2026";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const featuredStatusBadge = featuredTryout ? (
    <span className="h-6 px-2.5 rounded-full bg-yellow-400 text-ink-900 text-[12px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
      <Clock className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
      <span>
        {featuredTryout.isRegistered
          ? featuredTryout.status === "IN_PROGRESS"
            ? "Sedang dikerjakan"
            : featuredTryout.status === "FINISHED"
              ? "Selesai"
              : "Belum dikerjakan"
          : "Belum terdaftar"}
      </span>
    </span>
  ) : null;

  const onboardingSteps = [
    {
      label: "Tentukan target PTN & jurusan",
      done: Boolean(session.user.target?.trim()),
      href: "/profile",
      actionLabel: "Kerjakan",
    },
    {
      label: "Selesaikan pemanasan soal hari ini",
      done: Boolean(dailyStatus?.isCompleted),
      href: "/daily-streak",
      actionLabel: "Kerjakan",
    },
    {
      label: "Daftar tryout gratis pertamamu",
      done: myTryouts.length > 0,
      href: "#jadwal-tryout",
      actionLabel: "Kerjakan",
    },
  ];

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. TOP COMMAND & TARGET STRIP */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div
              className="w-14 h-14 rounded-full border border-border bg-surface-muted relative cursor-pointer overflow-hidden shadow-2xs hover:border-primary transition-colors"
              onClick={() => setIsAvatarPickerOpen(true)}
              title="Klik untuk memilih avatar karakter"
            >
              <Image
                src={getStudentAvatarUrl(session.user.image, session.user.id)}
                alt={session.user.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[#121F47]/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label text-text-muted">
                Ruang belajar · SNBT 2026
              </span>
              <Link
                href="/profile"
                className={`h-6 px-2.5 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 border transition-colors ${
                  session.user.target && getPtnTargetSummary(session.user.target) !== "Belum diatur"
                    ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                    : "bg-surface-muted text-text-body border-border hover:border-blue-300 hover:text-text"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-primary stroke-[1.75]" />
                <span>
                  {session.user.target && getPtnTargetSummary(session.user.target) !== "Belum diatur"
                    ? `Target: ${getPtnTargetSummary(session.user.target)}`
                    : "Atur target PTN"}
                </span>
              </Link>
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] text-text leading-tight">
              Halo, {firstName}
            </h1>
          </div>
        </div>

        {/* Summary Numbers Strip */}
        <div className="grid grid-cols-3 rounded-lg border border-border bg-surface divide-x divide-ink-100">
          <div className="px-4 py-3">
            <div className="text-label text-text-muted">Streak</div>
            <div className="mt-0.5 font-mono font-bold text-[19px] text-text tabular-nums inline-flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-yellow-500 stroke-[2]" />
              <span>{effectiveStreak} hr</span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-label text-text-muted">IRT terbaik</div>
            <div className="mt-0.5 font-mono font-bold text-[19px] text-primary tabular-nums">
              {bestScore ?? "-"}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-label text-text-muted">Soal diselesaikan</div>
            <div className="mt-0.5 font-mono font-bold text-[19px] text-text tabular-nums inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2]" />
              <span>{solvedQuestions.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FIRST-VIEW ASYMMETRIC BENTO GRID (7 Left Featured + 5 Right Daily Stack) */}
      <section
        aria-label="Ringkasan prioritas belajar"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* LEFT (7 col): Featured Tryout Card with Blue-Tinted /careers Banner */}
        <div className="lg:col-span-7 flex">
          {featuredTryout ? (
            <article
              className={`w-full bg-surface rounded-lg border border-border overflow-hidden flex flex-col transition-colors duration-[120ms] ${
                featuredTryout.isSpecial
                  ? "hover:border-purple-300"
                  : "hover:border-blue-300"
              }`}
            >
              <TryoutCardBanner
                isSpecial={featuredTryout.isSpecial}
                badge={featuredStatusBadge}
                sublabel={
                  <span className="inline-flex items-center gap-1.5">
                    <span>Free · {featuredTryout.solutionPrice || 1}</span>
                    <PixelCoin size={13} />
                    <span>untuk pembahasan</span>
                  </span>
                }
                rightFooter={
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/95 tabular-nums">
                    <Users className="w-3.5 h-3.5 stroke-[2]" />
                    <span>
                      {getDisplayedParticipants(
                        featuredTryout.id,
                        featuredTryout.participants
                      ).toLocaleString("id-ID")}{" "}
                      peserta
                    </span>
                  </span>
                }
              />

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Sistem IRT (E-Wallet untuk 10 besar)</span>
                  </div>

                  <h2 className="text-[22px] sm:text-[24px] font-bold text-text leading-snug tracking-[-0.015em]">
                    {featuredTryout.title}
                  </h2>

                  <p className="text-[14px] text-text-body leading-relaxed line-clamp-2">
                    {featuredTryout.description?.trim() ||
                      "Simulasi UTBK-SNBT lengkap mencakup 7 subtes TPS & Literasi dengan timer resmi, pemeringkatan nasional, dan analisis skor IRT."}
                  </p>

                  <TryoutScheduleTimeline
                    start={featuredTryout.scheduledStart}
                    end={featuredTryout.scheduledEnd}
                    className="pt-1 pb-0.5"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  {featuredTryout.isRegistered ? (
                    <Button
                      size="lg"
                      variant="primary"
                      onClick={() => router.push(`/tryout/${featuredTryout.id}`)}
                      className="sm:min-w-[200px] justify-between"
                    >
                      <span>
                        {featuredTryout.status === "FINISHED"
                          ? "Lihat tryout"
                          : featuredTryout.status === "IN_PROGRESS"
                            ? "Lanjutkan tryout"
                            : "Kerjakan tryout"}
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                    </Button>
                  ) : (
                    <div className="sm:min-w-[200px] group/btn transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={() =>
                          handleRegisterClick(featuredTryout as OngoingTryout)
                        }
                        className="relative w-full justify-between overflow-hidden shadow-md transition-[background-color,box-shadow] duration-150 hover:shadow-lg"
                      >
                        <span
                          aria-hidden="true"
                          className="animate-pass-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-blue-200/35 to-transparent"
                        />
                        <span className="relative z-10">Daftar tryout</span>
                        <ArrowRight
                          className="relative z-10 w-4 h-4 stroke-[1.75] transition-transform duration-150 ease-out group-hover/btn:translate-x-1 group-active/btn:translate-x-0"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  )}

                  <Link
                    href="/tryout"
                    className="min-h-[44px] px-4 rounded-md border border-border bg-surface text-[14px] font-semibold text-text hover:bg-surface-muted transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat semua jadwal</span>
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="w-full p-6 sm:p-8 rounded-lg border border-dashed border-border bg-surface-muted flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="text-label text-primary">Mulai simulasi</div>
                <h2 className="text-h3 text-text">
                  Belum ada jadwal tryout aktif saat ini
                </h2>
                <p className="text-[14px] text-text-body max-w-md">
                  Sambil menunggu gelombang berikutnya dibuka, kamu bisa langsung berlatih lewat Latihan Adaptif atau Arsip Soal Asli UTBK.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.push("/latihan")}>
                  Mulai Latihan Adaptif
                </Button>
                <Button variant="outline" onClick={() => router.push("/arsip-soal")}>
                  Buka Arsip Soal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (5 col): Hot Question of the Day Carousel + Subtest Snapshot Stack */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Card A: Hot Question of the Day (5 random unanswered questions, 5s auto-swipe loop) */}
          <HotQuestionsCard />

          {/* Card B: Progressive Multi-Phase Milestone */}
          <MilestoneCard
            hasTarget={Boolean(session.user.target?.trim())}
            dailyCompleted={Boolean(dailyStatus?.isCompleted)}
            registeredTryoutsCount={myTryouts.length}
            finishedTryoutsCount={
              userStats?.totalFinished ?? scoreHistory.length
            }
            solvedQuestions={solvedQuestions}
            currentStreak={effectiveStreak}
            bestScore={bestScore}
            onOpenScoreHistory={() => {
              tabManuallyChanged.current = true;
              setScheduleTab("history");
              document
                .getElementById("jadwal-tryout")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* 3. LEARNING ECOSYSTEM SHORTCUT STRIP (3 Compact Equal Tiles) */}
      <section aria-label="Fitur belajar Jitu" className="hidden grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/latihan"
          className="group bg-surface rounded-lg border border-border p-5 hover:border-blue-300 transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="w-9 h-9 rounded-md bg-blue-50 text-primary border border-blue-200 inline-flex items-center justify-center">
              <Zap className="w-4 h-4 stroke-[2]" />
            </span>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-text">Latihan Soal Adaptif</h3>
            <p className="text-[13px] text-text-body leading-relaxed">
              Drill bertahap 7 subtes SNBT dengan koreksi instan & pembahasan per butir.
            </p>
          </div>
        </Link>

        <Link
          href="/arsip-soal"
          className="group bg-surface rounded-lg border border-border p-5 hover:border-blue-300 transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-md bg-blue-50 text-primary border border-blue-200 inline-flex items-center justify-center">
                <BookOpen className="w-4 h-4 stroke-[2]" />
              </span>
              <span className="h-6 px-2.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-semibold inline-flex items-center">
                163 Paket · 2010–2026
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-text">Arsip Soal Asli UTBK</h3>
            <p className="text-[13px] text-text-body leading-relaxed">
              Workbench naskah ujian asli dengan timer 30 menit & lembar jawab digital.
            </p>
          </div>
        </Link>

        <Link
          href="/referral"
          className="group bg-surface rounded-lg border border-border p-5 hover:border-blue-300 transition-colors flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-md bg-yellow-100 border border-yellow-300/70 inline-flex items-center justify-center">
                <PixelCoin size={18} />
              </span>
              <span className="h-6 px-2.5 rounded-full bg-surface-muted border border-border text-text text-[11px] font-mono font-semibold inline-flex items-center tabular-nums">
                {tokenBalance} coin aktif
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[16px] font-bold text-text">Coin & Program Referral</h3>
            <p className="text-[13px] text-text-body leading-relaxed">
              Buka pembahasan tryout mulai 1 coin. Bagikan kode referralmu untuk bonus coin.
            </p>
          </div>
        </Link>
      </section>

      {/* 4. MIDDLE: Tryout Schedule Grid & Tabs */}
      <section id="jadwal-tryout" className="space-y-6 pt-2">
        <Tabs
          value={scheduleTab}
          onValueChange={(val) => {
            tabManuallyChanged.current = true;
            setScheduleTab(val as "my-tryouts" | "explore" | "history");
          }}
          className="w-full space-y-6"
        >
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
                {myTryouts.map((tryout) => {
                  const isFinished = tryout.status === "FINISHED";
                  const isProgress = tryout.status === "IN_PROGRESS";

                  const statusBadge = (
                    <span
                      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-bold shadow-2xs ${
                        isFinished
                          ? "bg-emerald-400 text-emerald-950"
                          : isProgress
                            ? "bg-yellow-400 text-ink-900"
                            : "bg-emerald-400 text-emerald-950"
                      }`}
                    >
                      {isFinished ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                      ) : isProgress ? (
                        <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                      <span>
                        {isFinished
                          ? "Selesai"
                          : isProgress
                            ? "Sedang dikerjakan"
                            : "Terdaftar"}
                      </span>
                    </span>
                  );

                  return (
                    <article
                      key={tryout.id}
                      className={`rounded-lg border border-border overflow-hidden flex flex-col hover:shadow-sm transition-all duration-[120ms] ${
                        tryout.isSpecial
                          ? "hover:border-purple-300"
                          : "hover:border-blue-300"
                      } ${isFinished ? "bg-surface-muted" : "bg-surface"}`}
                    >
                      <TryoutCardBanner
                        isSpecial={tryout.isSpecial}
                        badge={statusBadge}
                        sublabel={
                          <span className="inline-flex items-center gap-1.5">
                            <span>Free · {tryout.solutionPrice || 1}</span>
                            <PixelCoin size={13} />
                            <span>untuk pembahasan</span>
                          </span>
                        }
                        rightFooter={
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/95 tabular-nums">
                            <Users className="w-3.5 h-3.5 stroke-[2]" />
                            <span>
                              {getDisplayedParticipants(
                                tryout.id,
                                tryout.participants
                              ).toLocaleString("id-ID")}{" "}
                              peserta
                            </span>
                          </span>
                        }
                      />

                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary">
                            <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                            <span>Sistem IRT (E-Wallet untuk 10 besar)</span>
                          </div>

                          <h3 className="text-[20px] font-bold text-text leading-snug tracking-[-0.015em]">
                            {tryout.title}
                          </h3>

                          <p className="text-[14px] text-text-body leading-relaxed line-clamp-2">
                            {tryout.description?.trim() ||
                              "Tryout persiapan UTBK-SNBT 2026 nasional dengan penilaian IRT dan analisis subtes."}
                          </p>

                          <TryoutScheduleTimeline
                            start={tryout.scheduledStart}
                            end={tryout.scheduledEnd}
                            className="pt-1 pb-0.5"
                          />
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
                                ? "Lanjutkan tryout"
                                : "Kerjakan tryout"}
                          </span>
                          <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-lg border border-dashed border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[15px] text-text-body">
                  Kamu belum mendaftar tryout apa pun. Pilih jadwal tersedia untuk mulai simulasi SNBT gratis.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    tabManuallyChanged.current = true;
                    setScheduleTab("explore");
                  }}
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
                {marketTryouts.map((tryout) => (
                  <article
                    key={tryout.id}
                    className={`bg-surface rounded-lg border border-border overflow-hidden flex flex-col hover:shadow-sm transition-all duration-[120ms] ${
                      tryout.isSpecial
                        ? "hover:border-purple-300"
                        : "hover:border-blue-300"
                    }`}
                  >
                    <TryoutCardBanner
                      isSpecial={tryout.isSpecial}
                      badge={
                        <span className="h-6 px-2.5 rounded-full bg-yellow-400 text-ink-900 text-[12px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Belum terdaftar</span>
                        </span>
                      }
                      sublabel={
                        <span className="inline-flex items-center gap-1.5">
                          <span>Free · {tryout.solutionPrice || 1}</span>
                          <PixelCoin size={13} />
                          <span>untuk pembahasan</span>
                        </span>
                      }
                      rightFooter={
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/95 tabular-nums">
                          <Users className="w-3.5 h-3.5 stroke-[2]" />
                          <span>
                            {getDisplayedParticipants(
                              tryout.id,
                              tryout.participants
                            ).toLocaleString("id-ID")}{" "}
                            peserta
                          </span>
                        </span>
                      }
                    />

                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary">
                          <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Sistem IRT (E-Wallet untuk 10 besar)</span>
                        </div>

                        <h3 className="text-[20px] font-bold text-text leading-snug tracking-[-0.015em]">
                          {tryout.title}
                        </h3>

                        <p className="text-[14px] text-text-body leading-relaxed line-clamp-2">
                          {tryout.description?.trim() ||
                            "Tryout persiapan UTBK-SNBT 2026 nasional dengan penilaian IRT dan analisis subtes."}
                        </p>

                        <TryoutScheduleTimeline
                          start={tryout.scheduledStart}
                          end={tryout.scheduledEnd}
                          className="pt-1 pb-0.5"
                        />
                      </div>

                      <div className="w-full group/btn transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                        <Button
                          variant="primary"
                          className="w-full justify-between"
                          onClick={() =>
                            handleRegisterClick(tryout as OngoingTryout)
                          }
                        >
                          <span className="font-bold">Daftar tryout</span>
                          <ArrowRight
                            className="w-4 h-4 stroke-[1.75] transition-transform duration-150 ease-out group-hover/btn:translate-x-1 group-active/btn:translate-x-0"
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </div>
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
                  <h3 className="text-h3 text-text">Grafik skor</h3>
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

      {/* 4.5 BRAND BANNER: Platform Persiapan UTBK 2027 No. 1 di Indonesia */}
      <section aria-label="Banner JITU UTBK 2027">
        <div className="relative overflow-hidden rounded-xl border border-border bg-white px-6 py-6 sm:px-9 sm:py-7 shadow-2xs">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.08),transparent_70%)]"
          />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6">
            <div className="md:col-span-7 space-y-3">
              <h2
                style={{ fontFamily: '"Bricolage Grotesque", var(--font-jakarta), sans-serif' }}
                className="text-[24px] sm:text-[31px] font-extrabold text-text tracking-[-0.03em] leading-[1.15]"
              >
                Platform Persiapan UTBK 2027{" "}
                <span className="text-primary">No. 1 di Indonesia!</span>
              </h2>

              <p className="text-[13.5px] sm:text-[14.5px] text-text-body leading-relaxed max-w-xl">
                Tryout bersistem IRT akurat, ribuan arsip soal asli UTBK terkurasi, dan pembahasan interaktif untuk menembus PTN impianmu.
              </p>

              <div className="pt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-text-body">
                <span className="px-2.5 py-1 rounded-md bg-surface-muted border border-border">
                  Simulasi IRT Nasional
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-muted border border-border">
                  3.700+ Bank Soal Asli
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-muted border border-border">
                  Pembahasan Interaktif
                </span>
              </div>
            </div>

            <div className="md:col-span-5 flex items-center justify-center md:justify-end">
              <img
                src="/campus-pixel-art.png"
                alt="Ilustrasi Kampus Impian UI, ITB, dan UGM"
                className="w-full max-w-[360px] md:max-w-[400px] h-auto object-contain select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM: Panduan & Kabar SNBT (/blog) */}
      {articles.length > 0 && (
        <section aria-label="Panduan dan artikel SNBT" className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5">
              <div className="text-label text-text-muted">Bacaan strategi</div>
              <h2 className="text-h3 text-text">Panduan & Kabar SNBT</h2>
            </div>
            <Link
              href="/blog"
              className="text-[13px] font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
            >
              <span>Semua artikel</span>
              <ArrowRight className="w-4 h-4 stroke-[1.75]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group bg-surface rounded-lg border border-border p-5 hover:border-blue-300 transition-colors flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="h-5 px-2 rounded-full bg-blue-50 text-blue-800 font-semibold inline-flex items-center">
                      {article.category || "Panduan"}
                    </span>
                    <span className="text-text-muted inline-flex items-center gap-1 tabular-nums">
                      <FileText className="w-3 h-3" />
                      <span>{article.readTimeMinutes || 4} mnt baca</span>
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-text group-hover:text-primary leading-snug line-clamp-2 transition-colors">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-[13px] text-text-body line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                </div>
                <span className="text-[12px] font-semibold text-primary inline-flex items-center gap-1">
                  <span>Baca panduan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={selectedTryout?.title || ""}
        tokenCost={selectedTryout?.solutionPrice || 0}
        scheduledStart={selectedTryout?.scheduledStart}
        scheduledEnd={selectedTryout?.scheduledEnd}
        isLoading={registerLoading}
        error={registerError}
      />

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        currentImage={session.user.image}
        userId={session.user.id}
        onSaveAvatar={handleSaveAvatar}
        isSaving={isAvatarSaving}
      />
    </div>
  );
};

export default DashboardModule;
