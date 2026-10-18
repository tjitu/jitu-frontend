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
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            ARSIP HASIL UJIAN
          </div>
          <h1 className="font-display font-bold text-[30px] sm:text-[36px] leading-tight tracking-tight text-slate-900">
            Riwayat tryout
          </h1>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 border border-slate-200 bg-white divide-x divide-slate-100 shadow-xs">
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              SELESAI
            </div>
            <div className="font-mono font-bold text-[20px] text-slate-900 tabular-nums">
              {filteredHistory.length}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              TERTINGGI
            </div>
            <div className="font-mono font-bold text-[20px] text-blue-600 tabular-nums">
              {getHighestScore()}
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              RERATA
            </div>
            <div className="font-mono font-bold text-[20px] text-slate-900 tabular-nums">
              {calculateAverage()}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="inline-flex border border-slate-200 bg-slate-100/80 p-1 gap-1">
          {(["all", "Saintek", "Soshum"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`min-h-[36px] px-3.5 py-1 text-[13px] font-medium cursor-pointer transition-colors ${
                filter === cat
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </div>

        <div className="inline-flex border border-slate-200 bg-slate-100/80 p-1 gap-1">
          <button
            type="button"
            onClick={() => setSortBy("date")}
            className={`min-h-[36px] px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-medium cursor-pointer transition-colors ${
              sortBy === "date"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tanggal
          </button>
          <button
            type="button"
            onClick={() => setSortBy("score")}
            className={`min-h-[36px] px-3 py-1 font-mono text-[11px] uppercase tracking-wider font-medium cursor-pointer transition-colors ${
              sortBy === "score"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Skor tertinggi
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-300 bg-slate-50/50">
            <p className="text-[15px] text-slate-600">
              Belum ada tryout yang dikerjakan. Tryout #1 dibuka 2 Nov 2026.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200 shadow-xs p-6 space-y-6 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-[2px] border border-emerald-200 bg-emerald-50 font-mono text-[10px] uppercase tracking-wider font-semibold text-emerald-800 inline-flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2]" />
                      <span>Selesai</span>
                    </span>
                    <span className="px-2 py-[2px] border border-slate-200 bg-slate-50 font-mono text-[10px] uppercase tracking-wider text-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <h2 className="text-[19px] font-bold text-slate-900">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">
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
                <div className="p-4 border border-slate-200 bg-slate-50/70 min-w-[160px] text-left lg:text-right shadow-xs">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    SKOR IRT TOTAL
                  </div>
                  <div className="font-display font-extrabold text-[36px] leading-tight text-blue-600 tabular-nums mt-1">
                    {item.score}
                  </div>
                </div>
              </div>

              {/* Subtest Breakdown */}
              <div className="space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  RINCIAN PER SUBTES
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-slate-200 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-100 shadow-xs">
                  {[
                    { code: "PU", val: item.breakdown.pu },
                    { code: "PPU", val: item.breakdown.ppu },
                    { code: "PBM", val: item.breakdown.pbm },
                    { code: "PK", val: item.breakdown.pk },
                    { code: "LBI", val: item.breakdown.literasiIndo },
                    { code: "LBE", val: item.breakdown.literasiEng },
                  ].map((sub) => (
                    <div key={sub.code} className="p-3">
                      <div className="font-mono text-[11px] font-semibold text-slate-500">
                        {sub.code}
                      </div>
                      <div className="font-mono font-bold text-[18px] text-slate-900 tabular-nums mt-0.5">
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
