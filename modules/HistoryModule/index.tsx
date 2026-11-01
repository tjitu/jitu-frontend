"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";
import { tryoutHistory } from "./payload";

const HistoryModule = () => {
  const [filter, setFilter] = useState<"all" | "Saintek" | "Soshum">("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const filteredHistory = tryoutHistory
    .filter((item) => filter === "all" || item.category === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.score - a.score;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAverage = () => {
    if (filteredHistory.length === 0) return 0;
    const total = filteredHistory.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / filteredHistory.length);
  };

  const getHighestScore = () => {
    if (filteredHistory.length === 0) return 0;
    return Math.max(...filteredHistory.map((item) => item.score));
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-label text-primary">
            ARSIP HASIL UJIAN
          </div>
          <h1 className="text-h1 font-bold text-text">
            Riwayat tryout
          </h1>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 rounded-lg border border-border bg-surface divide-x divide-border overflow-hidden">
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              SELESAI
            </div>
            <div className="font-mono font-bold text-[20px] text-text tabular-nums">
              {filteredHistory.length}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              TERTINGGI
            </div>
            <div className="font-mono font-bold text-[20px] text-primary tabular-nums">
              {getHighestScore()}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="text-label text-text-muted">
              RERATA
            </div>
            <div className="font-mono font-bold text-[20px] text-text tabular-nums">
              {calculateAverage()}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="inline-flex rounded-md border border-border bg-surface-muted p-1 gap-1">
          {(["all", "Saintek", "Soshum"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`min-h-[36px] rounded-sm px-3.5 py-1 text-[13px] font-medium cursor-pointer transition-colors ${
                filter === cat
                  ? "bg-surface border border-border text-text font-semibold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-md border border-border bg-surface-muted p-1 gap-1">
          <button
            type="button"
            onClick={() => setSortBy("date")}
            className={`min-h-[36px] rounded-sm px-3.5 py-1 text-[13px] font-medium cursor-pointer transition-colors ${
              sortBy === "date"
                ? "bg-surface border border-border text-text font-semibold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Tanggal
          </button>
          <button
            type="button"
            onClick={() => setSortBy("score")}
            className={`min-h-[36px] rounded-sm px-3.5 py-1 text-[13px] font-medium cursor-pointer transition-colors ${
              sortBy === "score"
                ? "bg-surface border border-border text-text font-semibold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Skor tertinggi
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-border bg-surface-muted">
            <p className="text-[15px] text-text-muted">
              Belum ada tryout yang kamu kerjakan. Tryout #1 dibuka 16 Nov.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <article
              key={item.id}
              className="bg-surface border border-border rounded-lg p-6 space-y-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-border pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-6 px-2.5 rounded-full bg-success-soft text-[12px] font-semibold text-success-text inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Selesai</span>
                    </span>
                    <span className="h-6 px-2.5 rounded-full border border-border bg-surface-muted text-[12px] font-semibold text-text-body inline-flex items-center">
                      {item.category}
                    </span>
                  </div>

                  <h2 className="text-[19px] font-bold text-text">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-text-muted tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>{formatDate(item.date)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>{item.duration}</span>
                    </span>
                    <span>
                      {item.questionsAnswered}/{item.totalQuestions} dijawab
                    </span>
                  </div>
                </div>

                {/* Total IRT Score Box */}
                <div className="p-4 rounded-md border border-border bg-surface-muted min-w-[160px] text-left lg:text-right">
                  <div className="text-label text-text-muted">
                    SKOR IRT TOTAL
                  </div>
                  <div className="font-mono font-bold text-[36px] leading-tight text-primary tabular-nums mt-1">
                    {item.score}
                  </div>
                </div>
              </div>

              {/* Subtest Breakdown */}
              <div className="space-y-3">
                <div className="text-label text-text-muted">
                  RINCIAN PER SUBTES
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 rounded-md border border-border bg-surface divide-y sm:divide-y-0 sm:divide-x divide-border overflow-hidden">
                  {[
                    { code: "PU", val: item.breakdown.pu },
                    { code: "PPU", val: item.breakdown.ppu },
                    { code: "PBM", val: item.breakdown.pbm },
                    { code: "PK", val: item.breakdown.pk },
                    { code: "LBI", val: item.breakdown.literasiIndo },
                    { code: "LBE", val: item.breakdown.literasiEng },
                  ].map((sub) => (
                    <div key={sub.code} className="p-3">
                      <div className="font-mono text-[11px] font-semibold text-text-muted">
                        {sub.code}
                      </div>
                      <div className="font-mono font-bold text-[18px] text-text tabular-nums mt-0.5">
                        {sub.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary">
                  <span>Lihat hasil</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModule;
