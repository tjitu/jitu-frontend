"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { dailyProblems } from "@/modules/DailyStreakModule/payload";
import { Check, Flame, X } from "lucide-react";

const DailyStreak = () => {
  const [streak, setStreak] = useState(0);
  const [answeredToday, setAnsweredToday] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<any | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const storedStreak = localStorage.getItem("dailyStreak");
    const lastAnsweredDate = localStorage.getItem("lastAnsweredDate");
    const today = new Date().toISOString().split("T")[0];

    if (storedStreak) {
      setStreak(parseInt(storedStreak, 10));
    }

    if (lastAnsweredDate === today) {
      setAnsweredToday(true);
    } else {
      setAnsweredToday(false);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        lastAnsweredDate &&
        lastAnsweredDate !== yesterday.toISOString().split("T")[0]
      ) {
        setStreak(0);
        localStorage.setItem("dailyStreak", "0");
      }
    }

    if (!answeredToday) {
      const randomIndex = Math.floor(Math.random() * dailyProblems.length);
      setCurrentProblem(dailyProblems[randomIndex]);
    }
  }, []);

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !currentProblem) return;

    const isCorrect = selectedAnswer === currentProblem.answer;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("dailyStreak", newStreak.toString());
    localStorage.setItem("lastAnsweredDate", today);
    setAnsweredToday(true);
    setShowResult(true);
  };

  return (
    <div className="bg-white border-2 border-blue-900 shadow-[4px_4px_0_var(--blue-900)]">
      <div className="px-5 py-3.5 border-b-2 border-blue-900 bg-blue-800 text-white flex items-center justify-between">
        <span className="font-mono text-[12px] uppercase tracking-[0.06em] font-medium">
          SOAL HARIAN
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-[2px] border border-slate-600 bg-blue-900 font-mono text-[12px] text-signal tabular-nums">
          <Flame className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
          <span>{streak} hari</span>
        </span>
      </div>

      <div className="p-5 space-y-4">
        {answeredToday && !showResult ? (
          <div className="p-4 border-2 border-dashed border-slate-500 bg-blue-50 text-[14px] text-slate-700">
            Soal harian hari ini sudah dikerjakan. Kembali besok untuk lanjutkan rentetan belajarmu.
          </div>
        ) : (
          currentProblem && (
            <div className="space-y-4">
              <p className="text-[16px] font-semibold text-blue-900 leading-relaxed">
                {currentProblem.question}
              </p>
              <div className="space-y-2">
                {currentProblem.options.map((option: string, index: number) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = showResult && index === currentProblem.answer;
                  const isWrongSelected =
                    showResult && isSelected && index !== currentProblem.answer;

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={showResult}
                      onClick={() => setSelectedAnswer(index)}
                      className={`w-full min-h-[48px] p-3 border-2 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        isCorrectOption
                          ? "bg-blue-100 border-blue-600 text-blue-900"
                          : isWrongSelected
                            ? "bg-warn-100 border-warn text-warn"
                            : isSelected
                              ? "bg-blue-200 border-blue-500 text-blue-900"
                              : "bg-white border-blue-900 text-blue-900 hover:bg-blue-50"
                      }`}
                    >
                      <span className="w-7 h-7 border-[1.5px] border-blue-900 bg-white font-mono text-[12px] font-medium inline-flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="text-[14px] flex-1">{option}</span>
                      {isCorrectOption && (
                        <Check className="w-4 h-4 stroke-[1.75] text-blue-600 shrink-0" />
                      )}
                      {isWrongSelected && (
                        <X className="w-4 h-4 stroke-[1.75] text-warn shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!showResult ? (
                <Button
                  variant="signal"
                  onClick={handleAnswerSubmit}
                  className="w-full"
                  disabled={selectedAnswer === null}
                >
                  Kumpulkan
                </Button>
              ) : (
                <div
                  className={`p-3 border-2 border-blue-900 font-mono text-[13px] flex items-center gap-2 ${
                    selectedAnswer === currentProblem.answer
                      ? "bg-blue-100 text-blue-600"
                      : "bg-warn-100 text-warn"
                  }`}
                >
                  {selectedAnswer === currentProblem.answer ? (
                    <>
                      <Check className="w-4 h-4 stroke-[1.75]" />
                      <span>Jawaban benar. Rentetan bertambah.</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 stroke-[1.75]" />
                      <span>Jawaban belum tepat. Coba lagi besok.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DailyStreak;
