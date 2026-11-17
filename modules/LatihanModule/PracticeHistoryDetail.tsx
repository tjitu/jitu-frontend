"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, CheckCircle2, Crown, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import type { PracticeHistoryItem } from "@/lib/practice-store";
import InteractiveSolutionDeck, {
  renderMathContent,
} from "@/components/interactive-solution-deck";

const historyUrl = "/latihan?view=history";

export default function PracticeHistoryDetail({ attemptId }: { attemptId: string }) {
  const [item, setItem] = useState<PracticeHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        if (!cancelled) {
          setItem(null);
          setError("Masuk ke akun untuk melihat pembahasan soal.");
          setErrorStatus(401);
          setLoading(false);
        }
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/practice/history/${encodeURIComponent(attemptId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          if (!cancelled) setErrorStatus(response.status);
          throw new Error(data.error || "Gagal memuat pembahasan soal.");
        }
        if (!cancelled) setItem(data.item);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat pembahasan soal.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [attemptId]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-7 sm:py-10 space-y-6">
      <Link href={historyUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat & Pembahasan
      </Link>

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-text-muted">
          Memuat pembahasan soal…
        </div>
      ) : error || !item ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
          <p className="text-sm text-text-body">{error || "Soal tidak ditemukan."}</p>
          {errorStatus === 401 && <Link href="/login" className="text-sm font-bold text-primary hover:underline">Masuk ke Akun</Link>}
          {errorStatus === 403 && <Link href="/shop?highlight=premium-pass" className="text-sm font-bold text-primary hover:underline">Lihat PTN Pass</Link>}
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-primary">{item.subtest.replace(/_/g, " ")}</span>
              <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-muted">{item.difficulty}</span>
              <span className="text-xs text-text-muted">{new Date(item.answeredAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">Pembahasan Soal</h1>
            {item.topicTitle && <p className="text-sm text-text-muted">Materi: <strong className="text-text">{item.topicTitle}</strong>{item.subtopicTitle ? ` › ${item.subtopicTitle}` : ""}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 space-y-6">
            {item.narration && <div className="rounded-xl border border-border bg-surface-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMathContent(item.narration, { animatedHighlights: false }) }} />}
            <div className="text-base font-medium leading-relaxed text-text whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMathContent(item.content, { animatedHighlights: false }) }} />
            {item.imageUrl && <img src={item.imageUrl} alt="Ilustrasi soal" className="max-h-96 w-auto max-w-full rounded-xl border border-border object-contain" />}

            {item.options.length > 0 ? (
              <div className="space-y-2">
                {item.options.map((option, index) => {
                  const selected = item.selectedOptionId === option.id;
                  return (
                    <div key={option.id} className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${option.isCorrect ? "border-emerald-400 bg-emerald-50/70 text-emerald-950 font-semibold" : selected ? "border-rose-300 bg-rose-50/70 text-rose-900" : "border-border bg-surface text-text-body"}`}>
                      <span className="shrink-0 font-bold">{String.fromCharCode(65 + index)}.</span>
                      <div className="flex-1" dangerouslySetInnerHTML={{ __html: renderMathContent(option.content, { animatedHighlights: false }) }} />
                      {option.isCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
                      {!option.isCorrect && selected && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface-muted/30 p-4 text-sm space-y-2">
                <p>Jawaban Kamu: <strong className={item.isCorrect ? "text-emerald-600" : "text-rose-600"}>{item.inputText || "(Tidak menjawab)"}</strong></p>
                <p>Kunci Jawaban: <strong className="text-emerald-700">{item.correctAnswerText || "-"}</strong></p>
              </div>
            )}
            <p className={`text-sm font-bold ${item.isRevealOnly ? "text-primary" : item.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
              {item.isRevealOnly ? "Intip Pembahasan" : item.isCorrect ? "Jawaban benar" : "Jawaban kurang tepat"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7 space-y-4">
            <h2 className="text-lg font-bold text-text">Pembahasan</h2>
            {item.solution ? <InteractiveSolutionDeck solution={item.solution} /> : <p className="text-sm text-text-muted italic">Pembahasan detail untuk soal ini sedang dilengkapi oleh tim akademik.</p>}
          </div>
        </>
      )}
    </div>
  );
}
