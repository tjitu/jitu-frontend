"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Calendar,
  ArrowRight,
  Loader2,
  Check,
  Clock,
} from "lucide-react";
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
import { TryoutCardBanner } from "@/components/ui/tryout-card-banner";

interface TryOutData {
  id: string;
  title: string;
  number: string;
  participants: number;
  badge: string;
  solutionPrice: number;
  isPublic: boolean;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  isRegistered?: boolean;
  curationStatus?: string;
  isSandboxPreview?: boolean;
}

const TRYOUT_STALE_MS = 30_000;
let cachedTryouts: TryOutData[] | null = null;
let cachedTryoutsAt = 0;

const TryoutModule = () => {
  const router = useRouter();

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

  const formatSlotDate = (dateStr: string | null) => {
    if (!dateStr) return "16 Nov 2026";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-label text-text-muted">
            Jadwal tryout SNBT
          </div>
          <h1 className="text-h1 text-text">
            Daftar jadwal tryout
          </h1>
        </div>
        <p className="text-[15px] text-text-body max-w-md">
          Semua tryout gratis dikerjakan. Coin cuma kepakai kalau kamu mau buka skor IRT dan pembahasan.
        </p>
      </div>

      {/* Filter & Search Bar */}
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

      {/* Slot Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-lg jitu-skeleton"
            />
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
          {filteredTryouts.map((tryout, idx) => {
            const numLabel =
              tryout.title.match(/\d+/)?.[0] || String(idx + 1);

            const statusBadge =
              tryout.isSandboxPreview || tryout.curationStatus === "QC_SANDBOX" ? (
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-blue-100 text-blue-900 text-[12px] font-semibold shadow-2xs">
                  <span>QC Sandbox</span>
                </span>
              ) : tryout.isRegistered ? (
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-emerald-100 text-emerald-900 text-[12px] font-semibold shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Terdaftar</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/95 text-blue-900 text-[12px] font-semibold shadow-2xs">
                  <Clock className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Gratis · Rp0</span>
                </span>
              );

            return (
              <article
                key={tryout.id}
                onClick={() => router.push(`/tryout/${tryout.id}`)}
                className="bg-surface rounded-lg border border-border overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all duration-[120ms] cursor-pointer flex flex-col"
              >
                <TryoutCardBanner
                  label={`Tryout #${numLabel}`}
                  badge={statusBadge}
                  sublabel={tryout.badge || "Simulasi SNBT · 7 Subtes"}
                />

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <h2 className="text-[19px] sm:text-[20px] font-bold text-text leading-snug tracking-[-0.015em]">
                      {tryout.title}
                    </h2>

                    <div className="pt-3 border-t border-ink-100 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-text-muted tabular-nums">
                      <span className="inline-flex items-center gap-1.5 font-medium text-text-body">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.75] text-primary" />
                        <span>{formatSlotDate(tryout.scheduledStart)}</span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{tryout.participants.toLocaleString("id-ID")} peserta</span>
                      </span>
                      <span>·</span>
                      <span>
                        Pembahasan {tryout.solutionPrice || 1} coin
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={tryout.isRegistered ? "primary" : "outline"}
                    className="w-full justify-between"
                  >
                    <span>{tryout.isRegistered ? "Kerjakan" : "Lihat jadwal"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TryoutModule;
