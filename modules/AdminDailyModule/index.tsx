"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCcw, AlertCircle, Clock } from "lucide-react";
import {
  DailyQuestionResponse,
  getTodayDailyQuestion,
} from "@/lib/api/AdminDailyApi";
import { TodayQuestionPreview } from "./components/TodayQuestionPreview";
import { DailyActivityStats } from "./components/DailyActivityStats";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const AdminDailyModule = () => {
  const [data, setData] = useState<DailyQuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getNextUpdateDate = () => {
    const nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 1);
    nextUpdate.setHours(0, 0, 0, 0);
    return nextUpdate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTodayDailyQuestion();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error("Data soal harian gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT SOAL HARIAN...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Bank soal kosong</AlertTitle>
          <AlertDescription>
            Belum ada soal di database. Buat soal melalui menu Kelola Tryout.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b-2 border-blue-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            LATIHAN HARIAN
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Pantau soal harian
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-600 mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span>ROTASI BERIKUTNYA: {getNextUpdateDate()} · 00:00 WIB</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCcw className="h-4 w-4 mr-1.5" />
          Muat ulang
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayQuestionPreview question={data} />
        </div>

        <div className="lg:col-span-1">
          <DailyActivityStats stats={data.stats} />
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-900 p-4 text-sm text-blue-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-bold">Rotasi otomatis pukul 00:00 WIB</p>
          <p className="text-slate-700">
            Satu soal dipilih otomatis dari bank soal setiap hari dan disajikan
            serentak untuk seluruh peserta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDailyModule;
