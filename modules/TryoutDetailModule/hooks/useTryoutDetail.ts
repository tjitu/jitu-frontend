"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { TryoutDetail } from "../interface";
import { getUserStats, invalidateDashboardCache } from "@/lib/api/DashboardApi";
import { invalidateTryoutCatalogCache } from "../../TryoutModule";
import {
  getTryoutDetail,
  getTryoutLeaderboard,
  LeaderboardData,
} from "@/lib/api/tryout";
import { startTryoutAttempt, registerTryout } from "@/lib/api/exam";

export function useTryoutDetail() {
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
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);

  // Modal states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [userBalance, setUserBalance] = useState<number>(0);

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

      if (data.endDate && new Date() > new Date(data.endDate)) {
        try {
          const lbData = await getTryoutLeaderboard(tryoutId);
          setLeaderboardData(lbData);
        } catch {
          setLeaderboardError("Gagal memuat peringkat.");
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

  const handleRegister = () => {
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
      invalidateDashboardCache();
      invalidateTryoutCatalogCache();
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
          `/tryout/${tryoutId}/exam/1?review=true&attemptId=${finishedId}`
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
    isCompletedSubtest = false
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
          finishedAttemptId
        )}`
      );
      return;
    }

    setError("");
    try {
      const id = await ensureAttempt();
      router.push(
        `/tryout/${tryoutId}/exam/${subtestOrder}?attemptId=${encodeURIComponent(
          id
        )}`
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

  return {
    tryoutId,
    tryoutData,
    leaderboardData,
    isLoading,
    error,
    leaderboardError,
    isRegistering,
    isStartingAttempt,
    registerModalOpen,
    registerLoading,
    registerError,
    setRegisterModalOpen,
    unlockModalOpen,
    unlockLoading,
    unlockError,
    setUnlockModalOpen,
    userBalance,
    fetchDetail,
    handleRegister,
    onConfirmRegister,
    onConfirmUnlock,
    handleStart,
    handleStartSubtest,
    formatDate,
    router,
  };
}
