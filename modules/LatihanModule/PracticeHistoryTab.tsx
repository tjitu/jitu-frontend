"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Crown,
  History,
  Lock,
  Search,
  Sparkles,
  XCircle,
  BookOpen,
  X,
} from "lucide-react";
import type { PracticeHistoryItem } from "@/lib/practice-store";
import { PracticeHistoryRow } from "./components/PracticeHistoryRow";

type PracticeHistoryTabProps = {
  isPremium: boolean;
  totalAnswered: number;
  isAuthenticated: boolean;
  getAuthHeaders: () => Promise<Record<string, string>>;
};

type StatusFilter = "ALL" | "CORRECT" | "WRONG" | "REVEAL";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

  const counts = useMemo(() => {
    const correct = items.filter((i) => !i.isRevealOnly && i.isCorrect).length;
    const wrong = items.filter((i) => !i.isRevealOnly && !i.isCorrect).length;
    const reveal = items.filter((i) => i.isRevealOnly).length;
    return { all: items.length, correct, wrong, reveal };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === "CORRECT") return items.filter((i) => !i.isRevealOnly && i.isCorrect);
    if (statusFilter === "WRONG") return items.filter((i) => !i.isRevealOnly && !i.isCorrect);
    if (statusFilter === "REVEAL") return items.filter((i) => i.isRevealOnly);
    return items;
  }, [items, statusFilter]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-text">Masuk untuk Melihat Riwayat Latihan</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Login ke akun JITU kamu untuk menyimpan progres soal yang sudah dikerjakan.
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
            <Crown className="w-3.5 h-3.5" /> Fitur Khusus Premium Pass
          </div>
          <h3 className="text-xl font-black text-text">
            {totalAnswered > 0
              ? `${totalAnswered} Soal Tersimpan di Arsip Belajar`
              : "Arsip Riwayat & Pembahasan Soal Terkunci"}
          </h3>
          <p className="text-sm text-text-body leading-relaxed">
            Aktifkan <strong>Premium Pass</strong> untuk membuka kembali seluruh riwayat soal dan pembahasan interaktif kapan saja.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/shop?highlight=premium-pass"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Buka Riwayat dengan Premium Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header, Filters & Search Bar (Balanced UI) */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-100/80 border border-amber-300/70 text-amber-700 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Riwayat & Pembahasan ({items.length} Soal)
              </h3>
              <p className="text-xs text-text-muted">
                Pelajari ulang semua soal yang pernah kamu kerjakan beserta pembahasannya.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 sm:w-60 md:w-68">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari naskah / materi..."
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-border bg-surface-muted/40 text-xs text-text focus:outline-none focus:border-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={subtest}
              onChange={(e) => setSubtest(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-surface-muted/40 text-xs font-semibold text-text focus:outline-none focus:border-primary shrink-0 cursor-pointer"
            >
              {SUBTEST_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Pills (Semua, Benar, Kurang Tepat, Belum Dijawab) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/70">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-muted text-text-muted hover:text-text"
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("CORRECT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === "CORRECT"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Benar ({counts.correct})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("WRONG")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === "WRONG"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            <XCircle className="w-3 h-3" /> Kurang Tepat ({counts.wrong})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("REVEAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              statusFilter === "REVEAL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <BookOpen className="w-3 h-3" /> Belum dijawab ({counts.reveal})
          </button>
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
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-muted">
          Belum ada soal yang sesuai dengan filter ini.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <PracticeHistoryRow
              key={item.attemptId}
              item={item}
              isOpen={expandedId === item.questionId}
              onToggle={() => setExpandedId(expandedId === item.questionId ? null : item.questionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
