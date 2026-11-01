"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, BookOpen } from "lucide-react";
import {
  getDailyQuestion,
  getUserStreak,
  submitAnswer as submitAnswerApi,
  DailyQuestion as APIDailyQuestion,
} from "@/lib/api/DailyApi";
import { toast } from "sonner";

const DailyStreakModule = () => {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
  const [currentProblem, setCurrentProblem] =
    useState<APIDailyQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDailyData();
  }, []);

  const loadDailyData = async () => {
    try {
      setLoading(true);

      const streakData = await getUserStreak();
      setStreak(streakData.currentStreak);
      setBestStreak(streakData.bestStreak);
      setTotalProblemsSolved(streakData.totalProblemsSolved);

      const questionData = await getDailyQuestion();
      setCurrentProblem(questionData.question);
      setIsAnswered(questionData.alreadyAnswered);

      if (questionData.alreadyAnswered) {
        if (questionData.isCorrect !== undefined) {
          setIsCorrect(questionData.isCorrect);
        }
        if (questionData.userAnswer) {
          setSelectedAnswer(questionData.userAnswer);
        }
      }
    } catch (error) {
      console.error("Failed to load daily data:", error);
      toast.error("Data gagal dimuat. Muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentProblem || !selectedAnswer) return;

    setSubmitting(true);
    try {
      const result = await submitAnswerApi(currentProblem.id, selectedAnswer);

      if (result.success) {
        setIsCorrect(result.isCorrect || false);
        setIsAnswered(true);
        setExplanation(result.explanation || null);

        if (result.newStreak !== undefined) {
          setStreak(result.newStreak);
          setBestStreak(Math.max(bestStreak, result.newStreak));
        }

        if (result.isCorrect) {
          setTotalProblemsSolved(totalProblemsSolved + 1);
          toast.success("Jawaban benar. Streak harian bertambah.");
        } else {
          toast.error("Jawaban belum tepat. Cek pembahasan di bawah.");
        }
      } else {
        toast.error(result.message || "Gagal mengirim jawaban.");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      toast.error("Gagal mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT LATIHAN HARIAN...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
        <div>
          <p className="text-label text-primary mb-1">
            LATIHAN HARIAN · 1 SOAL TIAP HARI
          </p>
          <h1 className="text-h2 font-bold text-text">
            Latihan harian SNBT
          </h1>
          <p className="text-[14px] text-text-muted mt-1">
            Jawab 1 soal pilihan tiap hari untuk jaga ritme pengerjaanmu.
          </p>
        </div>
        <div className="h-7 rounded-full bg-yellow-100 px-3.5 inline-flex items-center font-semibold text-[12px] text-yellow-700">
          Streak: {streak} hari
        </div>
      </div>

      {/* 3 Fact-Sheet Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">
            STREAK AKTIF
          </div>
          <div className="font-mono text-2xl font-bold text-text tabular-nums">
            {streak} hari
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">
            REKOR TERBAIK
          </div>
          <div className="font-mono text-2xl font-bold text-primary tabular-nums">
            {bestStreak} hari
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">
            SOAL TERJAWAB
          </div>
          <div className="font-mono text-2xl font-bold text-text tabular-nums">
            {totalProblemsSolved} soal
          </div>
        </div>
      </div>

      {/* Daily Question Sheet */}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Badge variant="default">Soal hari ini</Badge>
          </div>
          {isAnswered && (
            <Badge variant={isCorrect ? "success" : "danger"}>
              {isCorrect ? "Benar" : "Salah"}
            </Badge>
          )}
        </div>

        {currentProblem ? (
          <div className="space-y-6">
            {currentProblem.imageUrl && (
              <div className="border border-border rounded-md p-3 bg-surface-muted">
                <img
                  src={currentProblem.imageUrl}
                  alt="Ilustrasi soal"
                  className="max-w-full h-auto rounded-sm"
                />
              </div>
            )}

            {currentProblem.narration && (
              <div className="bg-surface-muted border border-border rounded-md p-4 sm:p-5 text-text-body text-sm sm:text-base leading-relaxed max-w-[68ch]">
                {currentProblem.narration}
              </div>
            )}

            {currentProblem.content && (
              <div className="text-text text-base sm:text-[17px] leading-relaxed max-w-[68ch] font-medium">
                {currentProblem.content}
              </div>
            )}

            {/* Answer Area */}
            {currentProblem.type === "ISIAN_SINGKAT" ? (
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-text">
                  Jawaban singkat
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 rounded-md bg-surface border border-border font-mono text-base text-text outline-none hover:border-ink-300 focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
                  placeholder="Ketik jawaban kamu..."
                  value={selectedAnswer || ""}
                  onChange={(e) =>
                    !isAnswered && setSelectedAnswer(e.target.value)
                  }
                  disabled={isAnswered}
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentProblem.options.map((option, index) => {
                  const isSelected = selectedAnswer === option.id;
                  const isWrongAnswer =
                    isAnswered && isSelected && !isCorrect;
                  const isRightAnswer =
                    isAnswered && isSelected && isCorrect;
                  const optionLabel = String.fromCharCode(65 + index);

                  let rowClass =
                    "bg-surface border border-border hover:bg-surface-muted hover:border-ink-300 text-text-body";
                  let badgeClass =
                    "bg-surface-muted border border-border text-text-body";

                  if (isRightAnswer) {
                    rowClass =
                      "bg-success-soft border-2 border-success text-success-text font-semibold";
                    badgeClass = "bg-success border-success text-white";
                  } else if (isWrongAnswer) {
                    rowClass =
                      "bg-danger-soft border-2 border-danger text-danger-text";
                    badgeClass = "bg-danger border-danger text-white";
                  } else if (isSelected) {
                    rowClass =
                      "bg-blue-50 border-2 border-primary text-text font-medium";
                    badgeClass = "bg-primary border-primary text-white";
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        !isAnswered && setSelectedAnswer(option.id)
                      }
                      disabled={isAnswered}
                      className={`w-full min-h-[52px] rounded-md px-4 py-3 text-left flex items-center gap-3.5 transition-colors cursor-pointer ${rowClass}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-sm shrink-0 font-mono text-xs font-semibold flex items-center justify-center ${badgeClass}`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-sm sm:text-base flex-1 leading-relaxed">
                        {option.content}
                      </span>
                      {isRightAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                      )}
                      {isWrongAnswer && (
                        <XCircle className="w-5 h-5 text-danger shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!isAnswered && (
              <div className="pt-2">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || submitting}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Kirim jawaban"
                  )}
                </Button>
              </div>
            )}

            {isAnswered && explanation && (
              <div className="p-5 sm:p-6 rounded-md bg-surface-muted border border-border">
                <div className="flex items-center gap-2 text-label text-text pb-3 mb-3 border-b border-border">
                  <BookOpen className="w-4 h-4 text-primary" />
                  PEMBAHASAN
                </div>
                <p className="text-sm sm:text-base text-text-body leading-relaxed max-w-[68ch]">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-label text-text-subtle mb-1">
              BELUM TERSEDIA
            </p>
            <p className="text-sm text-text-muted">
              Soal latihan hari ini belum diterbitkan. Cek lagi nanti.
            </p>
          </div>
        )}
      </div>

      {/* 30-Day Streak Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Kalender 30 hari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {[...Array(30)].map((_, i) => {
              const active = i < streak;
              return (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-sm border font-mono text-xs flex items-center justify-center ${
                    active
                      ? "bg-primary border-primary text-white font-semibold"
                      : "bg-surface-muted border-border text-text-subtle"
                  }`}
                  title={`Hari ke-${i + 1}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyStreakModule;
