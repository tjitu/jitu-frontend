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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-1 font-medium">
            LATIHAN HARIAN · 1 SOAL TIAP HARI
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Latihan harian SNBT
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Jawab 1 soal pilihan tiap hari untuk jaga ritme pengerjaanmu.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-300 px-3.5 py-1.5 font-mono text-xs font-semibold text-amber-900 uppercase tracking-wider shadow-xs">
          STREAK: {streak} HARI
        </div>
      </div>

      {/* 3 Fact-Sheet Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 shadow-xs">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
            STREAK AKTIF
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {streak} hari
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 shadow-xs">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
            REKOR TERBAIK
          </div>
          <div className="font-mono text-2xl font-bold text-blue-600">
            {bestStreak} hari
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 shadow-xs">
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
            SOAL TERJAWAB
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900">
            {totalProblemsSolved} soal
          </div>
        </div>
      </div>

      {/* Daily Question Sheet */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white px-2.5 py-1 font-mono text-xs uppercase tracking-wider font-semibold">
              SOAL HARI INI
            </span>
          </div>
          {isAnswered && (
            <Badge variant={isCorrect ? "success" : "danger"}>
              {isCorrect ? "BENAR" : "SALAH"}
            </Badge>
          )}
        </div>

        {currentProblem ? (
          <div className="space-y-6">
            {currentProblem.imageUrl && (
              <div className="border border-slate-200 p-3 bg-slate-50">
                <img
                  src={currentProblem.imageUrl}
                  alt="Ilustrasi soal"
                  className="max-w-full h-auto"
                />
              </div>
            )}

            {currentProblem.narration && (
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 text-slate-800 text-sm sm:text-base leading-relaxed max-w-[68ch]">
                {currentProblem.narration}
              </div>
            )}

            {currentProblem.content && (
              <div className="text-slate-900 text-base sm:text-[17px] leading-relaxed max-w-[68ch] font-medium">
                {currentProblem.content}
              </div>
            )}

            {/* Answer Area */}
            {currentProblem.type === "ISIAN_SINGKAT" ? (
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-wider text-slate-500 font-medium">
                  JAWABAN SINGKAT
                </label>
                <input
                  type="text"
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 font-mono text-base text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
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
                    "bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800";
                  let badgeClass =
                    "bg-slate-100 border border-slate-200 text-slate-700";

                  if (isRightAnswer) {
                    rowClass =
                      "bg-emerald-50/80 border border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold";
                    badgeClass = "bg-emerald-600 border-emerald-600 text-white";
                  } else if (isWrongAnswer) {
                    rowClass =
                      "bg-rose-50/80 border border-rose-500 text-rose-950 ring-1 ring-rose-500";
                    badgeClass = "bg-rose-600 border-rose-600 text-white";
                  } else if (isSelected) {
                    rowClass =
                      "bg-blue-50/80 border border-blue-600 text-blue-950 ring-1 ring-blue-600 font-medium";
                    badgeClass = "bg-blue-600 border-blue-600 text-white";
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        !isAnswered && setSelectedAnswer(option.id)
                      }
                      disabled={isAnswered}
                      className={`w-full min-h-[52px] px-4 py-3 text-left flex items-center gap-3.5 transition-colors cursor-pointer shadow-xs ${rowClass}`}
                    >
                      <span
                        className={`w-7 h-7 shrink-0 font-mono text-xs font-semibold flex items-center justify-center ${badgeClass}`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-sm sm:text-base flex-1 leading-relaxed">
                        {option.content}
                      </span>
                      {isRightAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isWrongAnswer && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
              <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-700 font-semibold pb-3 mb-3 border-b border-slate-200">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  PEMBAHASAN
                </div>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed max-w-[68ch]">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-1">
              BELUM TERSEDIA
            </p>
            <p className="text-sm text-slate-600">
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
                  className={`w-9 h-9 border font-mono text-xs flex items-center justify-center ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-400"
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
