"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/api";
import { getActiveTryoutSandboxToken } from "@/lib/api/tryout";
import { RegisterModal } from "../DashboardModule/components/RegisterModal";
import { TryOutData } from "./types";
import { classifyTryouts } from "./utils/classify-tryouts";
import { LandscapeTryoutCard } from "./components/LandscapeTryoutCard";
import { PortraitTryoutCard } from "./components/PortraitTryoutCard";
import { EmptyTryoutCatalog } from "./components/EmptyTryoutCatalog";
import {
  TryoutFilters,
  type TryoutSortOrder,
  type TryoutStatusFilter,
} from "./components/TryoutFilters";
import { useTryoutRegistration } from "./hooks/useTryoutRegistration";

let cachedTryouts: TryOutData[] | null = null;

export function invalidateTryoutCatalogCache() {
  cachedTryouts = null;
}

const TryoutModule = () => {
  const [tryouts, setTryouts] = useState<TryOutData[]>(cachedTryouts ?? []);
  const [filteredTryouts, setFilteredTryouts] = useState<TryOutData[]>(cachedTryouts ?? []);
  const [isLoading, setIsLoading] = useState(!cachedTryouts);

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TryoutStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<TryoutSortOrder>("oldest");

  const {
    registerModalOpen,
    setRegisterModalOpen,
    selectedTryout,
    registerLoading,
    registerError,
    handleRegisterClick,
    onConfirmRegister,
    onGrowthChanged,
  } = useTryoutRegistration(setTryouts, (updated) => {
    cachedTryouts = updated;
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sandboxToken = getActiveTryoutSandboxToken();
    let active = true;
    const fetchTryouts = async () => {
      try {
        if (!cachedTryouts) setIsLoading(true);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sandboxToken) headers["x-sandbox-token"] = sandboxToken;
        const res = await fetch(`${BACKEND_URL}/tryout`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          if (active && !cachedTryouts) {
            setTryouts([]);
            setFilteredTryouts([]);
          }
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          if (active && !cachedTryouts) {
            setTryouts([]);
            setFilteredTryouts([]);
          }
          return;
        }

        const mappedData: TryOutData[] = data.map((item: TryOutData, idx: number) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          number: item.number || String(idx + 1).padStart(2, "0"),
          participants: item.participants || 0,
          badge: item.badge || "SNBT",
          solutionPrice: Number(item.solutionPrice ?? 0),
          isPublic: item.isPublic ?? true,
          scheduledStart: item.scheduledStart,
          scheduledEnd: item.scheduledEnd,
          duration: item.duration || 195,
          isRegistered: item.isRegistered ?? false,
          verificationStatus: item.verificationStatus ?? null,
          latestAttemptStatus: item.latestAttemptStatus ?? null,
          latestAttemptId: item.latestAttemptId ?? null,
          latestFinishedAttemptId: item.latestFinishedAttemptId ?? null,
          resumeUrl: item.resumeUrl ?? null,
          isWaitingTransition: Boolean(item.isWaitingTransition),
          nextSubtestOrder: item.nextSubtestOrder ?? null,
          curationStatus: item.curationStatus,
          isSandboxPreview: Boolean(item.isSandboxPreview || item.curationStatus === "QC_SANDBOX"),
        }));

        if (!sandboxToken) {
          cachedTryouts = mappedData;
        }

        if (active) {
          setTryouts(mappedData);
          setFilteredTryouts(mappedData);
        }
      } catch (error) {
        console.error("Error fetching tryouts:", error);
        if (active && !cachedTryouts) {
          setTryouts([]);
          setFilteredTryouts([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchTryouts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let result = [...tryouts];

    if (activeTab === "registered") {
      result = result.filter((t) => t.isRegistered);
    } else if (activeTab === "not-registered") {
      result = result.filter((t) => !t.isRegistered);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.badge.toLowerCase().includes(lowerQuery)
      );
    }

    result.sort((a, b) => {
      const dateA = a.scheduledStart ? new Date(a.scheduledStart).getTime() : NaN;
      const dateB = b.scheduledStart ? new Date(b.scheduledStart).getTime() : NaN;
      if (!Number.isFinite(dateA)) return Number.isFinite(dateB) ? 1 : 0;
      if (!Number.isFinite(dateB)) return -1;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredTryouts(result);
  }, [tryouts, activeTab, searchQuery, sortOrder]);

  // Show live tryouts and those starting within 24 hours.
  const { featured: featuredTryouts } = classifyTryouts(tryouts, currentTime);

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-h1 text-text">Daftar jadwal tryout</h1>
      </div>

      {/* 2. Landscape Card: Tryout sedang dan segera berlangsung */}
      {isLoading ? (
        <div className="h-64 sm:h-72 w-full rounded-xl jitu-skeleton" />
      ) : (
        featuredTryouts.length > 0 && (
          <section aria-label="Tryout sedang dan segera berlangsung" className="space-y-3">
            <div className="flex items-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-text text-[12px] font-bold uppercase tracking-wider shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SEDANG & SEGERA BERLANGSUNG
              </span>
            </div>
            <div className="space-y-6">
              {featuredTryouts.map((tryout) => (
                <LandscapeTryoutCard
                  key={tryout.id}
                  tryout={tryout}
                  onRegister={handleRegisterClick}
                />
              ))}
            </div>
          </section>
        )
      )}

      <TryoutFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* 4. Baru yang regular card: Regular Cards Grid (including the ongoing tryout) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-lg jitu-skeleton" />
          ))}
        </div>
      ) : tryouts.length === 0 ? (
        <EmptyTryoutCatalog />
      ) : filteredTryouts.length === 0 ? (
        <div className="p-10 rounded-lg border border-dashed border-border bg-surface-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[15px] text-text-body">
            Tidak ada jadwal tryout yang cocok dengan pencarianmu.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
          >
            Tampilkan semua
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTryouts.map((tryout) => (
            <PortraitTryoutCard
              key={tryout.id}
              tryout={tryout}
              onRegister={handleRegisterClick}
            />
          ))}
        </div>
      )}

      <RegisterModal
        tryoutId={selectedTryout?.id ?? ''}
        onGrowthChanged={() => { void onGrowthChanged().catch(() => {}); }}
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={selectedTryout?.title || ""}
        tokenCost={selectedTryout?.solutionPrice || 0}
        scheduledStart={selectedTryout?.scheduledStart}
        scheduledEnd={selectedTryout?.scheduledEnd}
        duration={selectedTryout?.duration || 195}
        isLoading={registerLoading}
        error={registerError}
      />
    </div>
  );
};

export default TryoutModule;
