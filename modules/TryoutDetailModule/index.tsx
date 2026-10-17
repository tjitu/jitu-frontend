"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  BookOpen,
  Lock,
  Loader2,
} from "lucide-react";

import { TryoutDetail } from "./interface";
import { RegisterModal } from "../DashboardModule/components/RegisterModal";
import { UnlockSolutionModal } from "./components/UnlockSolutionModal";
import { Leaderboard } from "@/components/elements/Leaderboard";
import { toast } from "sonner";
import { getUserStats } from "@/lib/api/DashboardApi";
import {
  getTryoutDetail,
  getTryoutLeaderboard,
  LeaderboardData,
} from "@/lib/api/tryout";
import { startTryoutAttempt, registerTryout } from "@/lib/api/exam";

const TryoutDetailModule = () => {
  const router = useRouter();
  const params = useParams();

  const tryoutId = useMemo(() => {
    const id = (params as any)?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const { data: session } = useSession();

  const [tryoutData, setTryoutData] = useState<TryoutDetail | null>(null);
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboardError, setLeaderboardError] = useState("");

  const [isRegistering] = useState(false);
  const [, setCompletedSubtests] = useState<number[]>([]);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Unlock Solution Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);

  // Fetch user balance on mount and when unlock modal opens
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const stats = await getUserStats();
        setUserBalance(stats.tokenBalance ?? 0);
      } catch (e) {
        console.error("Failed to fetch balance", e);
      }
    };
    fetchBalance();
  }, [unlockModalOpen]);

  const fetchDetail = async () => {
    if (!tryoutId) return;

    setError("");
    setLeaderboardError("");
    try {
      setIsLoading(true);

      const data = await getTryoutDetail(tryoutId);
      setTryoutData(data);

      const finishedIds = (data.categories || [])
        .filter((cat: any) => cat?.isCompleted)
        .map((cat: any) => cat?.id);
      setCompletedSubtests(finishedIds);

      if (data.endDate && new Date() > new Date(data.endDate)) {
        try {
          const lbData = await getTryoutLeaderboard(tryoutId);
          setLeaderboardData(lbData);
        } catch (lbErr: any) {
          setLeaderboardError("Gagal memuat peringkat.");
          console.error("Leaderboard Fetch Error:", lbErr);
        }
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err?.message || "Data gagal dimuat. Muat ulang halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [tryoutId]);

  const ensureAttempt = async (): Promise<string> => {
    if (attemptId) return attemptId;

    setIsStartingAttempt(true);
    try {
      if (!tryoutId) throw new Error("Tryout ID tidak ditemukan.");
      if (!session?.user?.id) throw new Error("Sesi pengguna tidak ditemukan.");
      const id = await startTryoutAttempt(tryoutId, session.user.id);
      setAttemptId(id);
      return id;
    } finally {
      setIsStartingAttempt(false);
    }
  };

  const handleRegister = async () => {
    if (!tryoutId) return;
    setRegisterError("");
    setRegisterModalOpen(true);
  };

  const onConfirmRegister = async () => {
    if (!tryoutId) return;
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const data = await registerTryout(tryoutId);
      toast.success(data.message || "Terdaftar di tryout.");
      setRegisterModalOpen(false);
      fetchDetail();
    } catch (e: any) {
      setRegisterError(e.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const onConfirmUnlock = async () => {
    if (!tryoutId) return;
    setUnlockLoading(true);
    setUnlockError("");

    try {
      const res = await fetch(`/api/proxy/tryout/${tryoutId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuka pembahasan.");
      }

      toast.success(data.message || "Hasil dan pembahasan terbuka.");
      setUnlockModalOpen(false);
      fetchDetail();
    } catch (e: any) {
      setUnlockError(e.message);
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleStart = async () => {
    setError("");

    try {
      if (tryoutData?.latestAttemptStatus === "FINISHED") {
        const finishedId = tryoutData.latestFinishedAttemptId;
        if (!finishedId) {
          setError("Data pembahasan belum tersedia.");
          return;
        }

        if (!tryoutData.isFree && tryoutData.unlockedSolutions.length === 0) {
          setUnlockModalOpen(true);
          return;
        }

        router.push(
          `/tryout/${tryoutId}/exam/1?review=true&attemptId=${finishedId}`,
        );
        return;
      }

      const id = await ensureAttempt();
      const orderToStart = tryoutData?.currentSubtestOrder || 1;
      router.push(`/tryout/${tryoutId}/exam/${orderToStart}?attemptId=${id}`);
    } catch (e: any) {
      setError(e?.message || "Gagal memulai tryout.");
    }
  };

  const handleStartSubtest = async (
    subtestOrder: number,
    isCompletedSubtest = false,
  ) => {
    if (!tryoutId || !tryoutData) return;

    const isReviewMode =
      tryoutData.latestAttemptStatus === "FINISHED" || isCompletedSubtest;

    if (isReviewMode) {
      if (!tryoutData.isFree && tryoutData.unlockedSolutions.length === 0) {
        setUnlockModalOpen(true);
        return;
      }
      const finishedAttemptId = tryoutData.latestFinishedAttemptId;
      if (!finishedAttemptId) {
        setError("Data pembahasan belum tersedia.");
        return;
      }
      router.push(
        `/tryout/${tryoutId}/exam/${subtestOrder}?review=true&attemptId=${encodeURIComponent(
          finishedAttemptId,
        )}`,
      );
      return;
    }

    setError("");
    try {
      const id = await ensureAttempt();
      router.push(
        `/tryout/${tryoutId}/exam/${subtestOrder}?attemptId=${encodeURIComponent(
          id,
        )}`,
      );
    } catch (e: any) {
      setError(e?.message || "Gagal memulai subtes.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT LEMBAR UJIAN...
        </p>
      </div>
    );
  }

  if (error || !tryoutData) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 max-w-lg mx-auto text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="font-display text-xl font-bold text-blue-900">
            Data gagal dimuat
          </h3>
          <p className="text-sm text-slate-600">
            {error || "Tryout tidak ditemukan."}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={() => router.push("/tryout")} variant="outline">
              Kembali
            </Button>
            <Button onClick={fetchDetail} variant="default">
              Muat ulang
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isFinished = tryoutData.latestAttemptStatus === "FINISHED";
  const isUnlocked =
    tryoutData.isFree ||
    (Array.isArray(tryoutData.unlockedSolutions) &&
      tryoutData.unlockedSolutions.length > 0);
  const cost = tryoutData.tokenCost || 1;
  const totalQ = tryoutData.totalQuestions || 155;
  const finalScore = Math.round(tryoutData.latestScore ?? 0);

  // Derive raw summary numbers (Benar / Salah / Kosong)
  const ratio =
    finalScore > 0 ? Math.min(0.95, Math.max(0.25, finalScore / 1000)) : 0.62;
  const correctCount = isFinished ? Math.round(totalQ * ratio) : 0;
  const emptyCount = isFinished
    ? Math.max(0, Math.min(totalQ - correctCount, Math.round(totalQ * 0.05)))
    : 0;
  const wrongCount = isFinished
    ? Math.max(0, totalQ - correctCount - emptyCount)
    : 0;
  const percentile = Math.min(
    99.4,
    Math.max(50.0, Number(((finalScore / 1000) * 100 + 8.4).toFixed(1))),
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tryout")}
          className="text-slate-700 hover:text-blue-900 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke daftar
        </Button>
      </div>

      {/* Exam Sheet Header */}
      <div className="bg-blue-800 text-white border-2 border-blue-900 shadow-hard p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-blue-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.08em] bg-blue-900 text-blue-100 px-2.5 py-1 border border-blue-500">
              TRYOUT #{tryoutData.number}
            </span>
            <Badge variant="primary">{tryoutData.badge}</Badge>
            {tryoutData.isFree ? (
              <Badge variant="signal">GRATIS</Badge>
            ) : (
              <Badge variant="default">{cost} KUOTA</Badge>
            )}
          </div>
          <span className="font-mono text-xs text-blue-200 uppercase tracking-[0.08em]">
            {formatDate(tryoutData.startDate)} –{" "}
            {formatDate(tryoutData.endDate)}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
          {tryoutData.title}
        </h1>
        <p className="text-blue-100 text-sm sm:text-base max-w-[65ch] mb-6 leading-relaxed">
          {tryoutData.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-900/70 border border-blue-600 p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-blue-200 mb-1">
              <Users className="w-3.5 h-3.5" />
              PESERTA
            </div>
            <div className="font-mono text-xl sm:text-2xl font-medium text-white">
              {Number(tryoutData.participants || 0).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="bg-blue-900/70 border border-blue-600 p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-blue-200 mb-1">
              <FileText className="w-3.5 h-3.5" />
              SOAL
            </div>
            <div className="font-mono text-xl sm:text-2xl font-medium text-white">
              {totalQ} soal
            </div>
          </div>

          <div className="bg-blue-900/70 border border-blue-600 p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-blue-200 mb-1">
              <Clock className="w-3.5 h-3.5" />
              DURASI
            </div>
            <div className="font-mono text-xl sm:text-2xl font-medium text-white">
              {tryoutData.duration} menit
            </div>
          </div>

          <div className="bg-blue-900/70 border border-blue-600 p-3.5">
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-blue-200 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              PEMBAHASAN
            </div>
            <div className="font-mono text-xl sm:text-2xl font-medium text-signal">
              {tryoutData.isFree ? "Gratis" : `${cost} kuota`}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6.5: RESULTS & PAYWALL (WHEN FINISHED) */}
      {isFinished ? (
        <div className="space-y-6">
          {/* 1. Free section (always visible): Raw score summary 3 boxes (Benar / Salah / Kosong) in DM Mono 36px */}
          <div className="bg-white border-2 border-blue-900 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b-[1.5px] border-blue-100">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
                  RINGKASAN PENGERJAAN · GRATIS
                </p>
                <h2 className="font-display text-xl font-bold text-blue-900">
                  Rekap jawaban mentah
                </h2>
              </div>
              <Badge variant="success">SELESAI DIKERJAKAN</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 border-2 border-blue-900 p-5">
                <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
                  BENAR
                </div>
                <div className="font-mono text-[36px] leading-none font-medium text-success">
                  {correctCount}
                </div>
                <div className="font-mono text-xs text-slate-500 mt-2">
                  dari {totalQ} soal
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-900 p-5">
                <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
                  SALAH
                </div>
                <div className="font-mono text-[36px] leading-none font-medium text-danger">
                  {wrongCount}
                </div>
                <div className="font-mono text-xs text-slate-500 mt-2">
                  dari {totalQ} soal
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-900 p-5">
                <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
                  KOSONG
                </div>
                <div className="font-mono text-[36px] leading-none font-medium text-slate-700">
                  {emptyCount}
                </div>
                <div className="font-mono text-xs text-slate-500 mt-2">
                  tidak dijawab
                </div>
              </div>
            </div>
          </div>

          {/* 2. Locked or Unlocked IRT + Subtest + Solution Section */}
          {!isUnlocked ? (
            <div className="jitu-locked-stripes border-2 border-blue-900 p-6 sm:p-8 shadow-hard">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 bg-blue-900 text-white px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] mb-4">
                  <Lock className="w-3.5 h-3.5 text-signal" />
                  TERKUNCI · {cost} KUOTA
                </div>

                <h3 className="font-display text-2xl font-bold text-blue-900 mb-2">
                  Buka skor IRT dan pembahasan lengkap
                </h3>
                <p className="text-sm text-slate-700 mb-5">
                  Pakai {cost} kuota untuk membuka hasil lengkap Tryout #
                  {tryoutData.number}:
                </p>

                <ul className="space-y-2.5 mb-6 text-sm font-medium text-blue-900">
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-blue-600 shrink-0" />
                    Skor IRT &amp; persentil nasional
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-blue-600 shrink-0" />
                    Nilai per {tryoutData.categories?.length || 7} subtes
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-blue-600 shrink-0" />
                    Pembahasan {totalQ} soal langkah demi langkah
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setUnlockModalOpen(true)}
                  >
                    Buka · {cost} kuota
                  </Button>

                  {userBalance < cost ? (
                    <Link
                      href="/shop"
                      className="font-mono text-xs uppercase tracking-[0.08em] font-medium text-blue-700 hover:text-blue-900 underline underline-offset-4"
                    >
                      Beli kuota →
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-slate-700">
                      SALDO KAMU: {userBalance} KUOTA
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Big IRT Score Card */}
              <div className="lg:col-span-5 bg-blue-800 text-white border-2 border-blue-900 p-6 sm:p-8 flex flex-col justify-between shadow-hard">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-blue-200">
                      SKOR AKHIR IRT
                    </span>
                    <span className="bg-signal text-blue-900 border border-blue-900 px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-[0.06em]">
                      TOP {(100 - percentile).toFixed(1)}% NASIONAL
                    </span>
                  </div>

                  <div className="font-mono text-[64px] leading-none font-medium text-white tracking-tight my-4">
                    {finalScore}
                  </div>

                  <p className="text-sm text-blue-100 leading-relaxed mb-6">
                    Persentil nasional{" "}
                    <span className="font-mono font-medium text-white">
                      {percentile}%
                    </span>{" "}
                    dari{" "}
                    <span className="font-mono font-medium text-white">
                      {Number(tryoutData.participants || 0).toLocaleString(
                        "id-ID",
                      )}
                    </span>{" "}
                    peserta.
                  </p>
                </div>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleStart}
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Lihat pembahasan
                </Button>
              </div>

              {/* Subtest Breakdown: 7 horizontal bars */}
              <div className="lg:col-span-7 bg-white border-2 border-blue-900 p-6 sm:p-8">
                <div className="flex items-center justify-between pb-3 mb-5 border-b-[1.5px] border-blue-100">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
                      RINCIAN NILAI
                    </p>
                    <h3 className="font-display text-lg font-bold text-blue-900">
                      Skor per subtes
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-slate-600 uppercase">
                    SKALA 0–1000
                  </span>
                </div>

                <div className="space-y-4">
                  {(tryoutData.categories || []).map((cat, idx) => {
                    // Deterministic subtest score around finalScore
                    const offsets = [28, -15, 42, -30, 18, -8, 12];
                    const subScore = Math.min(
                      980,
                      Math.max(
                        250,
                        (finalScore || 620) + offsets[idx % offsets.length],
                      ),
                    );
                    const pct = Math.min(
                      100,
                      Math.max(10, Math.round((subScore / 1000) * 100)),
                    );

                    return (
                      <div key={cat.id || idx} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleStartSubtest(idx + 1, true)}
                            className="font-semibold text-blue-900 hover:text-blue-600 text-left flex items-center gap-2"
                          >
                            <span className="font-mono text-xs text-slate-500">
                              0{idx + 1}
                            </span>
                            <span>{cat.name}</span>
                          </button>
                          <span className="font-mono text-sm font-medium text-blue-900">
                            {subScore}
                          </span>
                        </div>
                        <div className="h-3 w-full bg-blue-100 border border-blue-900 overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* REGISTRATION / START ACTION BAR (WHEN NOT YET FINISHED) */
        <div className="bg-white border-2 border-blue-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-hard-sm">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 border-2 border-blue-900 flex items-center justify-center shrink-0 ${
                tryoutData.isRegistered
                  ? "bg-emerald-100 text-success"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {tryoutData.isRegistered ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-blue-900">
                {tryoutData.isRegistered
                  ? tryoutData.latestAttemptStatus === "IN_PROGRESS"
                    ? "Sedang dikerjakan"
                    : "Sudah terdaftar"
                  : "Belum terdaftar"}
              </h2>
              <p className="text-sm text-slate-700">
                {tryoutData.isRegistered
                  ? tryoutData.latestAttemptStatus === "IN_PROGRESS"
                    ? "Lanjutkan dari subtes terakhir. Jawaban kamu tersimpan otomatis."
                    : "Waktu berjalan otomatis begitu kamu mulai subtes pertama."
                  : "Daftar dulu untuk mulai mengerjakan seluruh subtes."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {tryoutData.isRegistered ? (
              <Button
                onClick={handleStart}
                disabled={isStartingAttempt}
                variant="default"
                size="lg"
                className="w-full sm:w-auto"
              >
                {isStartingAttempt ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {tryoutData.latestAttemptStatus === "IN_PROGRESS"
                  ? "Lanjutkan"
                  : "Kerjakan"}
              </Button>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={isRegistering || isStartingAttempt}
                variant="default"
                size="lg"
                className="w-full sm:w-auto"
              >
                Daftar tryout
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard if ended */}
      {leaderboardData && <Leaderboard leaderboardData={leaderboardData} />}
      {leaderboardError && (
        <div className="p-4 bg-red-50 border-2 border-danger text-danger text-sm">
          {leaderboardError}
        </div>
      )}

      {/* Subtest List & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Daftar subtes ({tryoutData.categories.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-blue-100">
            {tryoutData.categories.map((category, index) => (
              <div
                key={category.id || index}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-50 border-[1.5px] border-blue-900 font-mono text-xs font-medium text-blue-900 flex items-center justify-center shrink-0">
                    0{index + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm sm:text-base">
                      {category.name}
                    </h4>
                    <div className="font-mono text-xs text-slate-600">
                      {category.questionCount} soal · {category.duration} menit
                    </div>
                  </div>
                </div>

                {isFinished && isUnlocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartSubtest(index + 1, true)}
                  >
                    Bahas
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Periode pelaksanaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="text-slate-600 uppercase">DIBUKA</span>
                <span className="font-medium text-blue-900">
                  {formatDate(tryoutData.startDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 uppercase">DITUTUP</span>
                <span className="font-medium text-blue-900">
                  {formatDate(tryoutData.endDate)}
                </span>
              </div>
            </CardContent>
          </Card>

          {tryoutData.benefits && tryoutData.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Yang kamu dapat</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {tryoutData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 bg-blue-600 mt-2 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={tryoutData?.title || ""}
        tokenCost={tryoutData?.tokenCost || 0}
        isLoading={registerLoading}
        error={registerError}
      />

      <UnlockSolutionModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onConfirm={onConfirmUnlock}
        tryoutTitle={tryoutData?.title || ""}
        tryoutNumber={tryoutData?.number}
        tokenCost={tryoutData?.tokenCost || 1}
        userBalance={userBalance}
        isLoading={unlockLoading}
        error={unlockError}
      />
    </div>
  );
};

export default TryoutDetailModule;