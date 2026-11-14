"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BACKEND_URL } from "@/lib/api";
import { getActiveTryoutSandboxToken } from "@/lib/api/tryout";
import { RegisterModal } from "../DashboardModule/components/RegisterModal";
import { TryOutData } from "./types";
import { classifyTryouts } from "./utils/classify-tryouts";
import { LandscapeTryoutCard } from "./components/LandscapeTryoutCard";
import { PortraitTryoutCard } from "./components/PortraitTryoutCard";
import { useTryoutRegistration } from "./hooks/useTryoutRegistration";

const TRYOUT_STALE_MS = 30_000;
let cachedTryouts: TryOutData[] | null = null;
let cachedTryoutsAt = 0;

export function invalidateTryoutCatalogCache() {
  cachedTryouts = null;
  cachedTryoutsAt = 0;
}

const TryoutModule = () => {
  const [tryouts, setTryouts] = useState<TryOutData[]>(cachedTryouts ?? []);
  const [filteredTryouts, setFilteredTryouts] = useState<TryOutData[]>(
    cachedTryouts ?? []
  );
  const [isLoading, setIsLoading] = useState(!cachedTryouts);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "registered" | "not-registered"
  >("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const {
    registerModalOpen,
    setRegisterModalOpen,
    selectedTryout,
    registerLoading,
    registerError,
    handleRegisterClick,
    onConfirmRegister,
  } = useTryoutRegistration(setTryouts, (updated) => {
    cachedTryouts = updated;
    cachedTryoutsAt = Date.now();
  });

  useEffect(() => {
    const sandboxToken = getActiveTryoutSandboxToken();
    if (!sandboxToken && cachedTryouts && Date.now() - cachedTryoutsAt < TRYOUT_STALE_MS) {
      setIsLoading(false);
      return;
    }

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

        const mappedData: TryOutData[] = data.map((item: any, idx: number) => ({
          id: item.id,
          title: item.title,
          number: item.number || String(idx + 1).padStart(2, "0"),
          participants: item.participants || 0,
          badge: item.badge || "SNBT",
          solutionPrice: item.solutionPrice || 0,
          isPublic: item.isPublic ?? true,
          scheduledStart: item.scheduledStart,
          scheduledEnd: item.scheduledEnd,
          isRegistered: item.isRegistered ?? false,
          curationStatus: item.curationStatus,
          isSandboxPreview: Boolean(item.isSandboxPreview || item.curationStatus === "QC_SANDBOX"),
        }));

        if (!sandboxToken) {
          cachedTryouts = mappedData;
          cachedTryoutsAt = Date.now();
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
      const dateA = new Date(a.scheduledStart || 0).getTime();
      const dateB = new Date(b.scheduledStart || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredTryouts(result);
  }, [tryouts, activeTab, searchQuery, sortOrder]);

  // Featured ongoing tryout for the top landscape card
  const { ongoing: ongoingTryouts } = classifyTryouts(tryouts);

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. Page Header: Daftar jadwal tryout */}
      <div className="border-b border-border pb-6">
        <h1 className="text-h1 text-text">
          Daftar jadwal tryout
        </h1>
      </div>

      {/* 2. Landscape Card: Tryout sedang berlangsung */}
      {isLoading ? (
        <div className="h-64 sm:h-72 w-full rounded-xl jitu-skeleton" />
      ) : (
        ongoingTryouts.length > 0 && (
          <section aria-label="Tryout sedang berlangsung" className="space-y-3">
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sedang berlangsung
              </span>
            </div>
            <div className="space-y-6">
              {ongoingTryouts.map((tryout) => (
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

      {/* 3. Bar yang tryout: Filter & Search Bar */}
      <div className="bg-surface rounded-lg border border-border p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Segmented Filter */}
        <div
          role="tablist"
          aria-label="Filter status pendaftaran"
          className="inline-flex rounded-md border border-border bg-surface-muted p-1 gap-1"
        >
          {[
            { id: "all", label: "Semua" },
            { id: "registered", label: "Terdaftar" },
            { id: "not-registered", label: "Belum terdaftar" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[34px] px-3.5 py-1.5 rounded-sm text-[13px] font-medium transition-colors duration-[120ms] cursor-pointer ${
                  active
                    ? "bg-surface text-text border border-border font-semibold"
                    : "border border-transparent text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[1.75] text-text-muted" />
            <Input
              placeholder="Cari nama tryout…"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortOrder}
            onValueChange={(val: "newest" | "oldest") => setSortOrder(val)}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Baru yang regular card: Regular Cards Grid (including the ongoing tryout) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-lg jitu-skeleton" />
          ))}
        </div>
      ) : tryouts.length === 0 ? (
        <div className="p-10 rounded-lg border border-dashed border-border bg-surface-muted text-center space-y-3">
          <Calendar className="w-10 h-10 text-primary mx-auto stroke-[1.5]" />
          <h3 className="text-base font-bold text-text">Belum ada tryout yang dibuka</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Jadwal Tryout Akbar SNBT berikutnya akan segera diumumkan. Kamu bisa berlatih ribuan soal di menu Latihan.
          </p>
          <div className="pt-2">
            <Link
              href="/latihan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
            >
              Mulai Latihan Soal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
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

export default TryoutModule;
