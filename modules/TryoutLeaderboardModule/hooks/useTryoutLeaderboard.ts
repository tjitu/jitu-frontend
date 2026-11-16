"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  getTryoutDetail,
  getTryoutLeaderboard,
  LeaderboardData,
  LeaderboardItem,
} from "@/lib/api/tryout";
import { TryoutDetail } from "@/modules/TryoutDetailModule/interface";
import { parsePtnTargets, PtnChoice } from "@/lib/target";

export function useTryoutLeaderboard() {
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

  const [activeTab, setActiveTab] = useState<"nasional" | "pilihan1">("nasional");
  const [searchQuery, setSearchQuery] = useState("");

  const targets = useMemo(() => {
    return parsePtnTargets((session?.user as any)?.target);
  }, [session?.user]);

  const p1 = useMemo(() => {
    return leaderboardData?.currentUserRank?.choice1 || targets.pilihan1;
  }, [leaderboardData?.currentUserRank?.choice1, targets.pilihan1]);

  const fetchAll = async () => {
    if (!tryoutId) return;

    setIsLoading(true);
    setError("");
    try {
      const [detailRes, lbRes] = await Promise.all([
        getTryoutDetail(tryoutId).catch(() => null),
        getTryoutLeaderboard(tryoutId).catch(() => null),
      ]);

      if (!detailRes) {
        throw new Error("Tryout tidak ditemukan.");
      }
      setTryoutData(detailRes);
      setLeaderboardData(lbRes);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data leaderboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!p1 && activeTab === "pilihan1") {
      setActiveTab("nasional");
    }
  }, [p1, activeTab]);

  useEffect(() => {
    fetchAll();
  }, [tryoutId]);

  const baseItems: LeaderboardItem[] = useMemo(() => {
    if (!leaderboardData) return [];
    if (Array.isArray(leaderboardData.all) && leaderboardData.all.length > 0) {
      return leaderboardData.all;
    }
    return leaderboardData.top10 || [];
  }, [leaderboardData]);

  const filteredItems: LeaderboardItem[] = useMemo(() => {
    let list = baseItems;

    if (activeTab === "pilihan1" && p1) {
      const targetUniId = p1.uniId?.toLowerCase();
      const targetAcronym = p1.acronym?.toLowerCase();
      const targetUni = p1.university?.toLowerCase();

      list = list.filter((item) => {
        if (!item.pilihan1) return false;
        const p = item.pilihan1;
        if (targetUniId && p.uniId && p.uniId.toLowerCase() === targetUniId && targetUniId !== "custom") {
          return true;
        }
        if (targetAcronym && p.acronym && p.acronym.toLowerCase() === targetAcronym) {
          return true;
        }
        if (targetUni && p.university && p.university.toLowerCase() === targetUni) {
          return true;
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((item) => item.name?.toLowerCase().includes(q));
    }

    return list;
  }, [baseItems, activeTab, p1, searchQuery]);

  return {
    tryoutId,
    tryoutData,
    leaderboardData,
    isLoading,
    error,
    p1,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredItems,
    router,
    refetch: fetchAll,
  };
}
