"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { getTryoutPreview } from "@/lib/api/AdminTryoutApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { QuestionDisplay } from "./components/QuestionDisplay";

interface AdminTryoutPreviewModuleProps {
  tryoutId: string;
}

const AdminTryoutPreviewModule: React.FC<AdminTryoutPreviewModuleProps> = ({
  tryoutId,
}) => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  const [activeSubtestIndex, setActiveSubtestIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTryoutPreview(tryoutId);
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Data pratinjau gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [tryoutId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT PRATINJAU...
        </span>
      </div>
    );
  }

  if (!data || !data.subtests || data.subtests.length === 0) {
    return (
      <div className="p-8 bg-white border-2 border-blue-900 text-center space-y-4">
        <p className="text-danger font-semibold">
          Tryout ini belum memiliki subtes atau soal.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Kembali
        </Button>
      </div>
    );
  }

  const currentSubtest = data.subtests[activeSubtestIndex];
  const questions = currentSubtest.questions || [];
  const currentQuestion = questions[activeQuestionIndex];

  const handleNext = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else if (activeSubtestIndex < data.subtests.length - 1) {
      setActiveSubtestIndex(activeSubtestIndex + 1);
      setActiveQuestionIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    } else if (activeSubtestIndex > 0) {
      setActiveSubtestIndex(activeSubtestIndex - 1);
      setActiveQuestionIndex(
        data.subtests[activeSubtestIndex - 1].questions.length - 1,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-blue-900">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
              PRATINJAU SOAL
            </p>
            <h1 className="font-display text-2xl font-bold text-blue-900 flex items-center gap-2">
              <span>{data.title}</span>
              <Badge variant="default">{data.batch}</Badge>
            </h1>
          </div>
        </div>
        <Badge variant="signal">MODE PRATINJAU</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <SidebarNavigation
          subtests={data.subtests}
          activeSubtestIndex={activeSubtestIndex}
          activeQuestionIndex={activeQuestionIndex}
          questions={questions}
          onSubtestChange={(idx) => {
            setActiveSubtestIndex(idx);
            setActiveQuestionIndex(0);
          }}
          onQuestionChange={setActiveQuestionIndex}
        />

        <QuestionDisplay
          question={currentQuestion}
          subtestName={currentSubtest.name}
          currentIndex={activeQuestionIndex}
          totalQuestions={questions.length}
          fontSize={fontSize}
          onFontSizeIncrease={() => setFontSize((p) => Math.min(28, p + 2))}
          onFontSizeDecrease={() => setFontSize((p) => Math.max(13, p - 2))}
          onPrev={handlePrev}
          onNext={handleNext}
          canPrev={!(activeSubtestIndex === 0 && activeQuestionIndex === 0)}
          canNext={
            !(
              activeSubtestIndex === data.subtests.length - 1 &&
              activeQuestionIndex === questions.length - 1
            )
          }
        />
      </div>
    </div>
  );
};

export default AdminTryoutPreviewModule;
