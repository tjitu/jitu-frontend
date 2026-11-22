import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Info, Flag, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FontSizeControl } from "./FontSizeControl";
import { PracticeQuestionText } from "@/components/practice-question-text";
import { TryoutSolution } from "@/components/tryout-solution";
import { renderMathContent } from "@/lib/render-math-content";

interface QuestionDisplayProps {
  question: any;
  subtestName: string;
  currentIndex: number;
  totalQuestions: number;
  fontSize: number;
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  subtestName,
  currentIndex,
  totalQuestions,
  fontSize,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) => {
  return (
    <div className="lg:col-span-9 space-y-6">
      <Card className="bg-white shadow-sm border-gray-200 overflow-hidden">
        <CardContent className="p-4 sm:p-8 lg:p-10">
          <div className="mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Soal {currentIndex + 1}
                </h3>
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium flex items-center gap-2">
                  <span>
                    {currentIndex + 1} dari {totalQuestions}
                  </span>
                  <span>•</span>
                  <Badge
                    variant="secondary"
                    className="text-[8px] sm:text-[9px] uppercase px-1.5 h-4"
                  >
                    {subtestName}
                  </Badge>
                </div>
              </div>

              <FontSizeControl
                fontSize={fontSize}
                onIncrease={onFontSizeIncrease}
                onDecrease={onFontSizeDecrease}
              />
            </div>
            <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    ((currentIndex + 1) / (totalQuestions || 1)) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {!question ? (
            <div className="h-40 sm:h-60 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-2xl">
              Belum ada soal tersedia.
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-10">
              <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed break-words"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <PracticeQuestionText narration={question.narration} question={question.content ?? ""} />
                  {question.imageUrl && <img src={question.imageUrl} alt="Ilustrasi soal" className="mt-4 max-h-96 rounded-xl object-contain" />}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {question.type === "PILIHAN_GANDA" &&
                  question.items?.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className={`w-full text-left p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center justify-between ${
                        item.isCorrect
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-[10px] sm:text-sm ${
                            item.isCorrect
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span
                          className={`text-sm sm:text-base ${
                            item.isCorrect
                              ? "text-emerald-900 font-bold"
                              : "text-gray-700"
                          }`}
                          style={{ fontSize: `${fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: renderMathContent(item.content) }}
                        />
                      </div>
                      {item.isCorrect && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                          Jawaban
                        </Badge>
                      )}
                    </div>
                  ))}

                {question.type === "ISIAN_SINGKAT" && (
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[10px] text-emerald-700 font-black uppercase tracking-widest">
                        Kunci Jawaban Singkat
                      </p>
                      <p
                        className="font-mono font-bold text-emerald-900"
                        style={{ fontSize: `${fontSize + 2}px` }}
                      >
                        {question.correctAnswer}
                      </p>
                    </div>
                  </div>
                )}

                {question.type === "BENAR_SALAH" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {question.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all ${
                          item.isCorrect
                            ? "border-emerald-500 bg-emerald-50 shadow-md"
                            : "border-gray-100 opacity-40 grayscale"
                        }`}
                      >
                        <span
                          className={`font-bold text-sm sm:text-lg ${
                            item.isCorrect
                              ? "text-emerald-900"
                              : "text-gray-400"
                          }`}
                          style={{ fontSize: `${fontSize + 2}px` }}
                          dangerouslySetInnerHTML={{ __html: renderMathContent(item.content) }}
                        />
                        {item.isCorrect && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                            Jawaban
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(question.structuredSolution || question.explanation) && (
                <div className="mt-6 sm:mt-12 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-blue-50 border-2 border-blue-100 relative overflow-hidden">
                  <div className="relative z-10 space-y-2 sm:space-y-4">
                    <div className="flex items-center gap-2 text-blue-700 font-black text-[10px] sm:text-xs uppercase tracking-widest">
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      Pembahasan Admin
                    </div>
                    <div
                      className="prose prose-blue prose-sm sm:prose-base max-w-none text-blue-900 leading-relaxed font-medium italic border-l-2 sm:border-l-4 border-blue-400 pl-3 sm:pl-6"
                      style={{ fontSize: `${fontSize - 2}px` }}
                    >
                      <TryoutSolution solution={question.structuredSolution} explanation={question.explanation} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 gap-4">
            <div className="hidden sm:flex items-center gap-2 text-gray-300">
              <Flag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Penanda tidak aktif
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={onPrev}
                disabled={!canPrev}
                variant="outline"
                className="flex-1 sm:flex-none   sm:py-6 rounded-xl sm:rounded-2xl font-bold border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Kembali</span>
              </Button>
              <Button
                onClick={onNext}
                disabled={!canNext}
                className="flex-1 sm:flex-none  sm:py-6 rounded-xl sm:rounded-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-sm">Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
