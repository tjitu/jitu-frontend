"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Calendar,
  Users,
  ArrowRight,
  Check,
  Clock,
  BookOpen,
  TrendingUp,
  Camera,
  Loader2,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { subtests } from "./payload";
import { ScoreData } from "./interface";
import { UserWithRole } from "@/lib/types";
import { useSession } from "@/lib/auth-client";
import {
  getUserStats,
  getOngoingTryouts,
  getAvailableTryouts,
  getScoreHistory,
  UserStats,
  OngoingTryout,
  AvailableTryout,
  ScoreHistory,
} from "@/lib/api/DashboardApi";
import { toast } from "sonner";
import { RegisterModal } from "./components/RegisterModal";
import { BACKEND_URL } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * DESIGN.md Section 6.3 — Student dashboard
 * - Top: next tryout (large slot card with mono countdown) and a Kerjakan button.
 * - Middle: tryout schedule grid (slot component, section 7).
 * - Bottom: history and quota balance, buy-quota button.
 * - Section 2.4: Multi-series charts separate by lightness (blue-300, 500, 700, 900), not hue.
 */
const SERIES_BLUES = ["#0B1B3F", "#1747E8", "#0F2D96", "#9DB0DC", "#FFD43B"];

const DashboardModule = () => {
  const router = useRouter();
  const [activeSubtests, setActiveSubtests] = useState<string[]>(["total"]);
  const { data: session, isPending } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [ongoingTryouts, setOngoingTryouts] = useState<OngoingTryout[]>([]);
  const [availableTryoutsData, setAvailableTryoutsData] = useState<
    AvailableTryout[]
  >([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

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
      } else {
        loadDashboardData();
      }
    }
  }, [session, isPending, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Gagal memuat data beranda. Coba muat ulang.");
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
      loadDashboardData();
    } catch (err: any) {
      setRegisterError(err.message);
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
      window.location.reload();
    } catch {
      toast.error("Gagal mengunggah foto. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-40 bg-blue-100 border-2 border-blue-900 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-blue-100 border-2 border-blue-900 animate-pulse" />
          <div className="h-32 bg-blue-100 border-2 border-blue-900 animate-pulse" />
          <div className="h-32 bg-blue-100 border-2 border-blue-900 animate-pulse" />
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
            (score) => score[subtest.id as keyof ScoreData]
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
          color: "#B9C5E2",
        },
      },
      x: {
        grid: {
          color: "#E4EBFA",
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

  // Primary featured tryout for Top Banner (DESIGN.md Section 6.3)
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
    if (!dateStr) return "2 Nov 2026";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* 1. Student Identity Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar
              className="w-14 h-14 border border-slate-200 shadow-xs cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-slate-100 text-slate-800 font-mono text-[16px] font-semibold">
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
              {isUploading ? (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-full">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              LEMBAR PESERTA · SNBT 2026
            </div>
            <h1 className="font-display font-bold text-[26px] sm:text-[30px] leading-tight tracking-tight text-slate-900">
              {session.user.name}
            </h1>
          </div>
        </div>

        {/* Summary Numbers Row */}
        <div className="grid grid-cols-3 border border-slate-200 bg-white divide-x divide-slate-100 shadow-xs">
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              TERDAFTAR
            </div>
            <div className="font-mono font-bold text-[20px] text-slate-900 tabular-nums">
              {myTryouts.length}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              SELESAI
            </div>
            <div className="font-mono font-bold text-[20px] text-slate-900 tabular-nums">
              {userStats?.totalFinished ?? 0}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              RERATA IRT
            </div>
            <div className="font-mono font-bold text-[20px] text-blue-600 tabular-nums">
              {avgScore ?? "-"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP: Next Tryout — Crisp Slot Card + Single Clean CTA */}
      <section aria-label="Tryout berikutnya">
        {featuredTryout ? (
          <div className="bg-white border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 border border-amber-300 bg-amber-50 font-mono text-[11px] uppercase tracking-wider font-semibold text-amber-900 inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 stroke-[2] text-amber-600" aria-hidden="true" />
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
                <span className="px-2.5 py-1 border border-blue-200 bg-blue-50 font-mono text-[11px] uppercase tracking-wider font-medium text-blue-800">
                  GRATIS DIKERJAKAN · PEMBAHASAN {featuredTryout.solutionPrice || 1} KUOTA
                </span>
              </div>

              <div className="font-display font-extrabold text-[32px] sm:text-[40px] leading-tight tracking-tight text-slate-900 tabular-nums">
                {formatSlotDate(featuredTryout.scheduledStart)}
              </div>

              <h2 className="text-[19px] sm:text-[21px] font-bold text-slate-900">
                {featuredTryout.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 stroke-[1.75]" aria-hidden="true" />
                  <span>{featuredTryout.participants} peserta</span>
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
                  <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
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
                  <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[15px] text-slate-600">
              Belum ada tryout yang dikerjakan. Tryout #1 dibuka 2 Nov 2026.
            </p>
            <Button onClick={() => router.push("/tryout")}>Lihat jadwal</Button>
          </div>
        )}
      </section>

      {/* 3. MIDDLE: Tryout Schedule Grid & Tabs (DESIGN.md Section 6.3 & Section 7) */}
      <section className="space-y-6">
        <Tabs defaultValue="my-tryouts" className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="my-tryouts">
                <span>Tryout kamu</span>
                <span className="px-1.5 py-[1px] border border-slate-200 bg-slate-100 font-mono text-[10px] tabular-nums text-slate-700">
                  {myTryouts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="explore" id="explore-trigger">
                <span>Jadwal tersedia</span>
                <span className="px-1.5 py-[1px] border border-slate-200 bg-slate-100 font-mono text-[10px] tabular-nums text-slate-700">
                  {marketTryouts.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="history">
                <span>Grafik skor</span>
              </TabsTrigger>
            </TabsList>

            <Link
              href="/tryout"
              className="font-mono text-[11px] uppercase tracking-wider font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5"
            >
              <span>Buka semua jadwal</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
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
                      className={`p-6 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors ${
                        isFinished ? "bg-slate-50/60" : "bg-white"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-700 tabular-nums">
                            TRYOUT #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-[2px] border font-mono text-[10px] uppercase tracking-wider font-semibold ${
                              isFinished
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : isProgress
                                  ? "border-amber-200 bg-amber-50 text-amber-900"
                                  : "border-blue-200 bg-blue-50 text-blue-800"
                            }`}
                          >
                            {isFinished ? (
                              <Check className="w-3 h-3 stroke-[2]" />
                            ) : (
                              <Clock className="w-3 h-3 stroke-[2]" />
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

                        <div className="font-display font-extrabold text-[30px] leading-tight tracking-tight text-slate-900 tabular-nums">
                          {formatSlotDate(tryout.scheduledStart)}
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-1">
                          <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                            {tryout.title}
                          </h3>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">
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
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </Button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[15px] text-slate-600">
                  Belum ada tryout yang dikerjakan. Tryout #1 dibuka 2 Nov 2026.
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
                    className="p-6 bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-700 tabular-nums">
                          TRYOUT #
                          {tryout.title.match(/\d+/)?.[0]?.padStart(2, "0") ||
                            String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="px-2 py-[2px] border border-blue-200 bg-blue-50 font-mono text-[10px] uppercase tracking-wider font-semibold text-blue-800">
                          Gratis · Rp0
                        </span>
                      </div>

                      <div className="font-display font-extrabold text-[30px] leading-tight tracking-tight text-slate-900 tabular-nums">
                        {formatSlotDate(tryout.scheduledStart)}
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-1">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                          {tryout.title}
                        </h3>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">
                          {tryout.participants} peserta · Pembahasan{" "}
                          {tryout.solutionPrice || 1} kuota
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full justify-between"
                      onClick={() =>
                        handleRegisterClick(tryout as OngoingTryout)
                      }
                    >
                      <span>Daftar gratis</span>
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </Button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-[15px] text-slate-600">
                  Semua jadwal yang tersedia sudah terdaftar di akunmu.
                </p>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: SCORE HISTORY */}
          <TabsContent value="history">
            <div className="bg-white border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                    PERKEMBANGAN NILAI IRT
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900">
                    Grafik skor per gelombang
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSubtest("total")}
                    className={`px-3 py-1 border text-[11px] font-mono uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                      activeSubtests.includes("total")
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Total
                  </button>
                  {subtests.map((subtest) => (
                    <button
                      key={subtest.id}
                      type="button"
                      onClick={() => toggleSubtest(subtest.id)}
                      className={`px-3 py-1 border text-[11px] font-mono uppercase tracking-wider font-medium cursor-pointer transition-colors ${
                        activeSubtests.includes(subtest.id)
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {subtest.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[340px] w-full">
                {scoreHistory.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center gap-3">
                    <TrendingUp className="w-8 h-8 stroke-[1.75] text-slate-400" />
                    <p className="text-[14px] text-slate-600">
                      Belum ada tryout yang dikerjakan. Grafik skor muncul setelah kamu menyelesaikan tryout.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* 4. BOTTOM: Quota Balance & Buy Quota Strip */}
      <section className="bg-slate-900 text-white border border-slate-800 shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Ticket className="w-4 h-4 stroke-[2] text-amber-400" aria-hidden="true" />
            <span>SALDO KUOTA PEMBAHASAN</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-display font-extrabold text-[32px] leading-none text-white tabular-nums">
              {userStats?.tokenBalance ?? 0} kuota
            </span>
            <span className="text-[13px] text-slate-400">
              (1 kuota = 1 pembahasan tryout · mulai Rp9.500)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/shop/past")}
            className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
          >
            Riwayat transaksi
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/shop")}
            className="bg-blue-600 hover:bg-blue-500 text-white border-transparent"
          >
            <span>Beli kuota</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Button>
        </div>
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
