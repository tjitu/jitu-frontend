"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  History,
  Lock,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { PracticeHistoryItem } from "@/lib/practice-store";
import InteractiveSolutionDeck, {
  renderMathContent,
} from "@/components/interactive-solution-deck";

type PracticeHistoryTabProps = {
  isPremium: boolean;
  totalAnswered: number;
  isAuthenticated: boolean;
  getAuthHeaders: () => Promise<Record<string, string>>;
};

const SUBTEST_OPTIONS = [
  { id: "ALL", label: "Semua Subtes" },
  { id: "PENALARAN_UMUM", label: "Penalaran Umum (PU)" },
  { id: "PENGETAHUAN_KUANTITATIF", label: "Pengetahuan Kuantitatif (PK)" },
  { id: "PENALARAN_MATEMATIKA", label: "Penalaran Matematika (PM)" },
  { id: "PEMAHAMAN_BACAAN_MENULIS", label: "Bacaan & Menulis (PBM)" },
  { id: "PENGETAHUAN_PEMAHAMAN_UMUM", label: "Pengetahuan Umum (PPU)" },
  { id: "LITERASI_INDONESIA", label: "Literasi Indonesia (LBI)" },
  { id: "LITERASI_INGGRIS", label: "Literasi Inggris (LBE)" },
];

export function PracticeHistoryTab({
  isPremium,
  totalAnswered,
  isAuthenticated,
  getAuthHeaders,
}: PracticeHistoryTabProps) {
  const [items, setItems] = useState<PracticeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subtest, setSubtest] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!isPremium || !isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (subtest !== "ALL") params.set("subtest", subtest);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/practice/history?${params.toString()}`, {
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal memuat riwayat soal.");
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat riwayat soal.");
    } finally {
      setLoading(false);
    }
  }, [isPremium, isAuthenticated, subtest, search, getAuthHeaders]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-text">Masuk untuk Melihat Riwayat Latihan</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Login ke akun JITU kamu untuk menyimpan progres soal yang sudah dikerjakan agar tidak muncul berulang kali.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50/80 via-surface to-surface p-8 text-center space-y-5 shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" /> Fitur Khusus PTN Pass
          </div>
          <h3 className="text-xl font-black text-text">
            {totalAnswered > 0
              ? `${totalAnswered} Soal Sudah Tersimpan di Arsip Belajarmu`
              : "Arsip Riwayat & Pembahasan Soal Terkunci"}
          </h3>
          <p className="text-sm text-text-body leading-relaxed">
            Soal yang sudah kamu jawab otomatis dihilangkan dari antrean latihan agar latihanmu selalu segar. Akun gratis tetap mendapat pembahasan langsung setelah menjawab (hingga 10 soal/hari), sedangkan untuk membuka kembali seluruh riwayat soal dan pembahasannya kapan saja, aktifkan <strong>PTN Pass</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/shop?highlight=premium-pass"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Buka Riwayat dengan PTN Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-amber-100/80 border border-amber-300/70 text-amber-700 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text">
              Riwayat & Pembahasan ({items.length} Soal)
            </h3>
            <p className="text-xs text-text-muted">
              Pelajari ulang semua soal yang pernah kamu kerjakan beserta pembahasan interaktifnya.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari naskah / topik..."
              className="pl-8 pr-3 py-2 rounded-xl border border-border bg-surface-muted/40 text-xs text-text focus:outline-none focus:border-primary w-48 sm:w-56"
            />
          </div>

          <select
            value={subtest}
            onChange={(e) => setSubtest(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-surface-muted/40 text-xs font-medium text-text focus:outline-none focus:border-primary"
          >
            {SUBTEST_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Memuat riwayat soal dan pembahasan…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Belum ada soal yang selesai dikerjakan pada filter ini.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = expandedId === item.questionId;
            const letters = ["A", "B", "C", "D", "E"];
            return (
              <div
                key={item.attemptId}
                className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(isOpen ? null : item.questionId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(isOpen ? null : item.questionId);
                    }
                  }}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-surface-muted/30 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                        {item.subtest.replace(/_/g, " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-muted text-[11px] font-semibold">
                        {item.difficulty}
                      </span>
                      {item.isRevealOnly ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                          Intip Pembahasan
                        </span>
                      ) : item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Benar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                          <XCircle className="w-3 h-3" /> Kurang Tepat
                        </span>
                      )}
                      <span className="text-[11px] text-text-muted ml-auto sm:ml-0">
                        {new Date(item.answeredAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div
                      className="text-sm text-text line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(item.content, { animatedHighlights: false }),
                      }}
                    />

                    {item.topicTitle && (
                      <div className="text-xs text-text-muted">
                        Materi: <strong className="text-text">{item.topicTitle}</strong>
                        {item.subtopicTitle ? ` › ${item.subtopicTitle}` : ""}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary pt-1">
                    <span>{isOpen ? "Tutup" : "Lihat Bahas"}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border p-4 sm:p-6 bg-surface-muted/20 space-y-5">
                    {item.narration && (
                      <div
                        className="p-4 rounded-xl bg-surface border border-border text-sm text-text-body leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: renderMathContent(item.narration, { animatedHighlights: false }),
                        }}
                      />
                    )}

                    <div
                      className="text-sm sm:text-base font-medium text-text leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: renderMathContent(item.content, { animatedHighlights: false }),
                      }}
                    />

                    {item.options.length > 0 ? (
                      <div className="space-y-2">
                        {item.options.map((opt, idx) => {
                          const isUserChoice = item.selectedOptionId === opt.id;
                          const isKey = opt.isCorrect;
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${
                                isKey
                                  ? "border-emerald-400 bg-emerald-50/70 text-emerald-950 font-semibold"
                                  : isUserChoice
                                  ? "border-rose-300 bg-rose-50/70 text-rose-900"
                                  : "border-border bg-surface text-text-body"
                              }`}
                            >
                              <span className="font-bold shrink-0">{letters[idx] || idx + 1}.</span>
                              <div
                                className="flex-1"
                                dangerouslySetInnerHTML={{
                                  __html: renderMathContent(opt.content, { animatedHighlights: false }),
                                }}
                              />
                              {isKey && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                              {!isKey && isUserChoice && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-surface border border-border text-sm space-y-1">
                        <div>
                          Jawaban Kamu:{" "}
                          <strong className={item.isCorrect ? "text-emerald-600" : "text-rose-600"}>
                            {item.inputText || "(Tidak menjawab)"}
                          </strong>
                        </div>
                        <div>
                          Kunci Jawaban:{" "}
                          <strong className="text-emerald-700">{item.correctAnswerText || "-"}</strong>
                        </div>
                      </div>
                    )}

                    {item.solution ? (
                      <InteractiveSolutionDeck solution={item.solution} />
                    ) : (
                      <div className="p-4 rounded-xl border border-border bg-surface text-xs text-text-muted italic">
                        Pembahasan detail untuk soal ini sedang dilengkapi oleh tim akademik.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
