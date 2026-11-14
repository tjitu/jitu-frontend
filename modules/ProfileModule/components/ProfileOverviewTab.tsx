"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversityLogo } from "@/components/UniversityLogo";
import { PtnChoice, PtnTargets } from "@/lib/target";

export interface AttemptItem {
  id: string;
  title: string;
  date: string;
  score: number;
  status: string;
}

export interface ProfileStatsData {
  totalTryout: number;
  averageScore: number;
  lastScore: number;
  streak: number;
}

interface ProfileOverviewTabProps {
  stats: ProfileStatsData;
  attempts: AttemptItem[];
  isLoadingData: boolean;
  ptnTargets: PtnTargets;
  onOpenEditModal: () => void;
  onViewAllHistory: () => void;
  onNavigateTryout: () => void;
}

export function ProfileOverviewTab({
  stats,
  attempts,
  isLoadingData,
  ptnTargets,
  onOpenEditModal,
  onViewAllHistory,
  onNavigateTryout,
}: ProfileOverviewTabProps) {
  const configuredChoices: Array<{ label: string; choice: PtnChoice }> = [
    ptnTargets.pilihan1 ? { label: "Pilihan 1", choice: ptnTargets.pilihan1 } : null,
    ptnTargets.pilihan2 ? { label: "Pilihan 2", choice: ptnTargets.pilihan2 } : null,
    ptnTargets.pilihan3 ? { label: "Pilihan 3", choice: ptnTargets.pilihan3 } : null,
  ].filter((item): item is { label: string; choice: PtnChoice } => item !== null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">SKOR TERAKHIR</div>
          <div className="font-mono text-2xl font-bold text-text tabular-nums">
            {stats.lastScore || "-"}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">RATA-RATA IRT</div>
          <div className="font-mono text-2xl font-bold text-primary tabular-nums">
            {stats.averageScore || "-"}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-label text-text-muted mb-1">TRYOUT SELESAI</div>
          <div className="font-mono text-2xl font-bold text-text tabular-nums">
            {stats.totalTryout}
          </div>
        </div>
      </div>

      {/* Target PTN Card on Overview - Clean Row Layout */}
      <div className="bg-surface border border-border rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-text">
              Target PTN Impian
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Kampus dan program studi tujuan SNBT kamu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEditModal}
            className="shrink-0 text-xs gap-1.5 self-start sm:self-center"
          >
            <Pencil size={13} />
            {configuredChoices.length > 0 ? "Ubah Target PTN" : "Atur Target PTN"}
          </Button>
        </div>

        {configuredChoices.length > 0 ? (
          <div className="divide-y divide-border/70 border-t border-border/70">
            {configuredChoices.map(({ label, choice }, idx) => (
              <div
                key={idx}
                className="py-3 first:pt-3.5 last:pb-0.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <UniversityLogo
                    logo={choice.logo}
                    acronym={choice.acronym}
                    size={28}
                  />
                  <div className="min-w-0">
                    <div className="text-[15px] sm:text-base font-bold text-text leading-snug truncate">
                      {choice.university}
                      {choice.acronym && choice.acronym !== choice.university
                        ? ` (${choice.acronym})`
                        : ""}
                    </div>
                    <div className="text-sm font-medium text-primary truncate">
                      {choice.jurusan}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-text-muted px-2.5 py-1 rounded-md bg-surface-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted pt-1">
            Belum ada target PTN yang diatur. Tentukan hingga 3 kampus dan program studi impianmu.
          </p>
        )}
      </div>

      {stats.totalTryout === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-text">
              Belum ada tryout yang dikerjakan
            </h3>
            <p className="text-[14px] text-text-body mt-0.5">
              Coba 1 paket tryout gratis untuk lihat baseline skor IRT kamu.
            </p>
          </div>
          <Button variant="primary" onClick={onNavigateTryout}>
            Coba tryout gratis
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tryout terakhir</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAllHistory}>
            Lihat semua
          </Button>
        </CardHeader>
        <CardContent>
          {attempts.length > 0 ? (
            <div className="divide-y divide-border">
              {attempts.slice(0, 3).map((attempt) => (
                <HistoryRow key={attempt.id} attempt={attempt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              {isLoadingData ? "Memuat data..." : "Belum ada tryout yang selesai."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function HistoryRow({ attempt }: { attempt: AttemptItem }) {
  const statusMap: Record<
    string,
    { label: string; variant: "success" | "default" | "warn" }
  > = {
    EXCELLENT: { label: "Sangat baik", variant: "success" },
    COMPLETED: { label: "Selesai", variant: "default" },
    ONGOING: { label: "Berlangsung", variant: "warn" },
  };

  const st = statusMap[attempt.status] || {
    label: attempt.status,
    variant: "default",
  };

  return (
    <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold text-text text-sm sm:text-base">
          {attempt.title}
        </h4>
        <p className="text-xs text-text-muted tabular-nums">
          {new Date(attempt.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={st.variant}>{st.label}</Badge>
        <div className="text-right min-w-[56px]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
            Skor
          </div>
          <div className="font-mono text-lg font-bold text-primary tabular-nums">
            {attempt.score}
          </div>
        </div>
      </div>
    </div>
  );
}
