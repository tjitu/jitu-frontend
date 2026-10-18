"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

const TryoutModule = () => {
  const router = useRouter();

  const [tryouts, setTryouts] = useState<TryOutData[]>([]);
  const [filteredTryouts, setFilteredTryouts] = useState<TryOutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "registered" | "not-registered"
  >("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const fetchTryouts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BACKEND_URL}/tryout`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Gagal mengambil data tryout");

        const data = await res.json();
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
        }));

        setTryouts(mappedData);
        setFilteredTryouts(mappedData);
      } catch (error) {
        console.error("Error fetching tryouts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTryouts();
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
    if (!dateStr) return "2 Nov 2026";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            JADWAL SIMULASI UTBK-SNBT
          </div>
          <h1 className="font-display font-bold text-[30px] sm:text-[36px] leading-tight tracking-tight text-slate-900">
            Daftar jadwal tryout
          </h1>
        </div>
        <p className="text-[15px] text-slate-600 max-w-md">
          Semua jadwal gratis dikerjakan. Kuota cuma dipakai saat kamu membuka pembahasan.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 shadow-xs p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Segmented Filter */}
        <div
          role="tablist"
          aria-label="Filter status pendaftaran"
          className="inline-flex border border-slate-200 bg-slate-100/80 p-1 gap-1"
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
                className={`min-h-[36px] px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[1.75] text-slate-400" />
            <Input
              placeholder="Cari nama gelombang…"
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortOrder}
            onValueChange={(val: "newest" | "oldest") => setSortOrder(val)}
          >
            <SelectTrigger className="w-full sm:w-[150px] h-10">
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
              className="h-64 bg-slate-100 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTryouts.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[15px] text-slate-600">
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
              tryout.title.match(/\d+/)?.[0]?.padStart(2, "0") ||
              String(idx + 1).padStart(2, "0");

            return (
              <article
                key={tryout.id}
                onClick={() => router.push(`/tryout/${tryout.id}`)}
                className="p-6 bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-slate-700 tabular-nums">
                      TRYOUT #{numLabel}
                    </span>
                    {tryout.isRegistered ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-[2px] border border-emerald-200 bg-emerald-50 font-mono text-[10px] uppercase tracking-wider font-semibold text-emerald-800">
                        <Check className="w-3 h-3 stroke-[2]" />
                        <span>Terdaftar</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-[2px] border border-blue-200 bg-blue-50 font-mono text-[10px] uppercase tracking-wider font-semibold text-blue-800">
                        <Clock className="w-3 h-3 stroke-[2]" />
                        <span>Gratis · Rp0</span>
                      </span>
                    )}
                  </div>

                  {/* 30px Display Date */}
                  <div className="font-display font-extrabold text-[30px] leading-tight tracking-tight text-slate-900 tabular-nums">
                    {formatSlotDate(tryout.scheduledStart)}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <h2 className="text-[16px] font-bold text-slate-900 leading-snug">
                      {tryout.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{tryout.participants.toLocaleString("id-ID")} peserta</span>
                      </span>
                      <span>·</span>
                      <span>
                        Pembahasan {tryout.solutionPrice || 1} kuota
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant={tryout.isRegistered ? "primary" : "outline"}
                  className="w-full justify-between"
                >
                  <span>{tryout.isRegistered ? "Kerjakan" : "Lihat jadwal"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TryoutModule;
