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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b-2 border-blue-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            LATIHAN HARIAN · 1 SOAL TIAP HARI
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Latihan harian SNBT
          </h1>
          <p className="text-sm text-slate-700 mt-1">
            Jawab 1 soal pilihan tiap hari untuk jaga ritme pengerjaanmu.
          </p>
        </div>
        <div className="bg-signal border-2 border-blue-900 px-3.5 py-2 font-mono text-xs font-medium text-blue-900 uppercase tracking-[0.06em]">
          STREAK: {streak} HARI
        </div>
      </div>

      {/* 3 Fact-Sheet Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-blue-900 p-5">
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
            STREAK AKTIF
          </div>
          <div className="font-mono text-3xl font-medium text-blue-900">
            {streak} hari
          </div>
        </div>

        <div className="bg-white border-2 border-blue-900 p-5">
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
            REKOR TERBAIK
          </div>
          <div className="font-mono text-3xl font-medium text-blue-900">
            {bestStreak} hari
          </div>
        </div>

        <div className="bg-white border-2 border-blue-900 p-5">
          <div className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600 mb-1">
            SOAL TERJAWAB
          </div>
          <div className="font-mono text-3xl font-medium text-blue-900">
            {totalProblemsSolved} soal
          </div>
        </div>
      </div>

      {/* Daily Question Sheet */}
      <div className="bg-white border-2 border-blue-900 p-6 sm:p-8 shadow-hard-sm">
        <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b-[1.5px] border-blue-100">
          <div className="flex items-center gap-2">
            <span className="bg-blue-800 text-white px-2.5 py-1 font-mono text-xs uppercase tracking-[0.08em] font-medium">
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
              <div className="border-[1.5px] border-blue-200 p-3 bg-blue-50">
                <img
                  src={currentProblem.imageUrl}
                  alt="Ilustrasi soal"
                  className="max-w-full h-auto"
                />
              </div>
            )}

            {currentProblem.narration && (
              <div className="bg-blue-50 border-[1.5px] border-blue-200 p-4 sm:p-5 text-blue-900 text-sm sm:text-base leading-[1.65] max-w-[68ch]">
                {currentProblem.narration}
              </div>
            )}

            {currentProblem.content && (
              <div className="text-blue-900 text-base sm:text-[17px] leading-[1.65] max-w-[68ch] font-medium">
                {currentProblem.content}
              </div>
            )}

            {/* Answer Area */}
            {currentProblem.type === "ISIAN_SINGKAT" ? (
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-[0.08em] text-slate-700">
                  JAWABAN SINGKAT
                </label>
                <input
                  type="text"
                  className="w-full h-12 px-3.5 bg-white border-[1.5px] border-slate-300 font-mono text-base text-blue-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                    "bg-white border-[1.5px] border-blue-200 hover:bg-blue-100 hover:border-blue-500 text-blue-900";
                  let badgeClass =
                    "bg-blue-50 border-[1.5px] border-blue-200 text-blue-900";

                  if (isRightAnswer) {
                    rowClass =
                      "bg-emerald-50 border-2 border-[#15803D] text-blue-900 font-semibold";
                    badgeClass = "bg-[#15803D] border-[#15803D] text-white";
                  } else if (isWrongAnswer) {
                    rowClass =
                      "bg-red-50 border-2 border-[#DC2626] text-blue-900";
                    badgeClass = "bg-[#DC2626] border-[#DC2626] text-white";
                  } else if (isSelected) {
                    rowClass =
                      "bg-blue-200 border-2 border-blue-500 text-blue-900 font-medium";
                    badgeClass = "bg-blue-500 border-blue-700 text-white";
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        !isAnswered && setSelectedAnswer(option.id)
                      }
                      disabled={isAnswered}
                      className={`w-full min-h-[56px] px-4 py-3 text-left flex items-center gap-3.5 transition-colors ${rowClass}`}
                    >
                      <span
                        className={`w-8 h-8 shrink-0 font-mono text-sm font-medium flex items-center justify-center ${badgeClass}`}
                      >
                        {optionLabel}
                      </span>
                      <span className="text-sm sm:text-base flex-1 leading-[1.55]">
                        {option.content}
                      </span>
                      {isRightAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                      )}
                      {isWrongAnswer && (
                        <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
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
                  variant="default"
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
              <div className="p-5 sm:p-6 bg-blue-50 border-2 border-blue-900">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-blue-700 font-medium pb-3 mb-3 border-b border-blue-200">
                  <BookOpen className="w-4 h-4" />
                  PEMBAHASAN
                </div>
                <p className="text-sm sm:text-base text-blue-900 leading-[1.65] max-w-[68ch]">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-slate-500 mb-1">
              BELUM TERSEDIA
            </p>
            <p className="text-sm text-slate-700">
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
                  className={`w-9 h-9 border-[1.5px] font-mono text-xs flex items-center justify-center ${
                    active
                      ? "bg-blue-500 border-blue-900 text-white font-medium"
                      : "bg-blue-50 border-blue-200 text-slate-500"
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
