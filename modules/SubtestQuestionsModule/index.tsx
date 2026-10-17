"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import QuestionList from "./components/QuestionList";
import QuestionForm from "./components/QuestionForm";
import {
  getQuestionsBySubtest,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  Question,
  CreateQuestionPayload,
} from "@/lib/api/AdminQuestionApi";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface SubtestQuestionsModuleProps {
  subtestId: string;
  tryoutId: string;
}

const SubtestQuestionsModule: React.FC<SubtestQuestionsModuleProps> = ({
  subtestId,
  tryoutId,
}) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getQuestionsBySubtest(subtestId);
      setQuestions(data);
    } catch (error) {
      console.error(error);
      toast.error("Daftar soal gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [subtestId]);

  useEffect(() => {
    if (subtestId) {
      fetchQuestions();
    }
  }, [subtestId, fetchQuestions]);

  const handleBack = () => {
    if (isCreating) {
      setIsCreating(false);
      setEditingQuestion(null);
    } else {
      router.push(`/admin/tryout/${tryoutId}`);
    }
  };

  const handleSave = async (payload: CreateQuestionPayload) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        toast.success("Soal diperbarui.");
      } else {
        await createQuestion(subtestId, payload);
        toast.success("Soal ditambahkan.");
      }
      setIsCreating(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan soal.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id);
      toast.success("Soal dihapus.");
      fetchQuestions();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus soal.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-5 border-b-2 border-blue-900">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600">
            BANK SOAL SUBTES
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            {isCreating
              ? editingQuestion
                ? "Ubah soal"
                : "Tambah soal baru"
              : "Kelola soal subtes"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar soal</CardTitle>
            <CardDescription className="font-mono text-xs">
              TOTAL: {questions.length} SOAL
            </CardDescription>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Tambah soal
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <QuestionForm
              initialData={editingQuestion}
              onSave={handleSave}
              onCancel={() => {
                setIsCreating(false);
                setEditingQuestion(null);
              }}
            />
          ) : (
            <QuestionList
              questions={questions}
              onDelete={handleDelete}
              onEdit={(q) => {
                setEditingQuestion(q);
                setIsCreating(true);
              }}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubtestQuestionsModule;
