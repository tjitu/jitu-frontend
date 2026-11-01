import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyQuestionStats } from "@/lib/api/AdminDailyApi";
import { Users, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface DailyActivityStatsProps {
  stats: DailyQuestionStats;
}

export const DailyActivityStats: React.FC<DailyActivityStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
            <Users className="h-4 w-4" />
            Total pengerjaan hari ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono font-bold text-text tabular-nums">{stats.totalAttempts}</div>
          <p className="text-xs text-text-muted mt-1">Peserta telah mencoba menjawab</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tingkat akurasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono font-bold text-primary tabular-nums">{stats.successRate.toFixed(1)}%</div>
          <div className="w-full bg-surface-muted border border-border rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-success-soft border-success/30">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-success-text flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Benar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-mono font-bold text-success-text tabular-nums">{stats.correctAnswers}</div>
          </CardContent>
        </Card>

        <Card className="bg-danger-soft border-danger/30">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-danger-text flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Salah
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-mono font-bold text-danger-text tabular-nums">{stats.incorrectAnswers}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
