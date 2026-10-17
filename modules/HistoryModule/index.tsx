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
      <div className="border-b-2 border-blue-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
            ARSIP HASIL UJIAN
          </div>
          <h1 className="font-display font-extrabold text-[34px] sm:text-[44px] leading-[1.02] tracking-[-0.025em] text-blue-900">
            Riwayat tryout
          </h1>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 border-2 border-blue-900 bg-white divide-x divide-slate-300">
          <div className="px-4 py-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-slate-700">
              SELESAI
            </div>
            <div className="font-mono font-medium text-[22px] text-blue-900 tabular-nums">
              {filteredHistory.length}
            </div>
          </div>
          <div className="px-4 py-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-slate-700">
              TERTINGGI
            </div>
            <div className="font-mono font-medium text-[22px] text-blue-500 tabular-nums">
              {getHighestScore()}
            </div>
          </div>
          <div className="px-4 py-2.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-slate-700">
              RERATA
            </div>
            <div className="font-mono font-medium text-[22px] text-blue-900 tabular-nums">
              {calculateAverage()}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-blue-900 p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="inline-flex border-2 border-blue-900 bg-blue-50 divide-x divide-slate-300">
          {(["all", "Saintek", "Soshum"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`min-h-[40px] px-4 font-semibold text-[14px] cursor-pointer ${
                filter === cat
                  ? "bg-white text-blue-900 border-b-[3px] border-b-blue-500"
                  : "text-slate-700 hover:bg-blue-100"
              }`}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </div>

        <div className="inline-flex border-2 border-blue-900 bg-blue-50 divide-x divide-slate-300">
          <button
            type="button"
            onClick={() => setSortBy("date")}
            className={`min-h-[40px] px-4 font-mono text-[12px] uppercase tracking-[0.06em] cursor-pointer ${
              sortBy === "date"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-900 hover:bg-blue-100"
            }`}
          >
            Tanggal
          </button>
          <button
            type="button"
            onClick={() => setSortBy("score")}
            className={`min-h-[40px] px-4 font-mono text-[12px] uppercase tracking-[0.06em] cursor-pointer ${
              sortBy === "score"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-900 hover:bg-blue-100"
            }`}
          >
            Skor tertinggi
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-500 bg-white">
            <p className="text-[16px] text-slate-700">
              Belum ada tryout yang dikerjakan. Tryout #1 dibuka 2 Nov 2026.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <article
              key={item.id}
              className="bg-white border-2 border-blue-900 shadow-[4px_4px_0_var(--blue-900)] p-6 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-300 pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-blue-100 font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900 inline-flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[1.75]" />
                      <span>Selesai</span>
                    </span>
                    <span className="px-2 py-[2px] border-[1.5px] border-blue-900 bg-white font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900">
                      {item.category}
                    </span>
                  </div>

                  <h2 className="text-[22px] font-bold text-blue-900">
                    {item.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700 tabular-nums">
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
                <div className="p-4 border-2 border-blue-900 bg-blue-50 min-w-[160px] text-left lg:text-right">
                  <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-slate-700">
                    SKOR IRT TOTAL
                  </div>
                  <div className="font-display font-extrabold text-[44px] leading-[1.02] text-blue-500 tabular-nums mt-1">
                    {item.score}
                  </div>
                </div>
              </div>

              {/* Subtest Breakdown (No gradients, blue scale only) */}
              <div className="space-y-3">
                <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-slate-700">
                  RINCIAN PER SUBTES
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border-2 border-blue-900 bg-white divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  {[
                    { code: "PU", val: item.breakdown.pu },
                    { code: "PPU", val: item.breakdown.ppu },
                    { code: "PBM", val: item.breakdown.pbm },
                    { code: "PK", val: item.breakdown.pk },
                    { code: "LBI", val: item.breakdown.literasiIndo },
                    { code: "LBE", val: item.breakdown.literasiEng },
                  ].map((sub) => (
                    <div key={sub.code} className="p-3">
                      <div className="font-mono text-[12px] font-medium text-slate-700">
                        {sub.code}
                      </div>
                      <div className="font-mono font-medium text-[20px] text-blue-900 tabular-nums mt-0.5">
                        {sub.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary">
                  <span>Lihat hasil</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
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
