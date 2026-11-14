"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, Users, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/elements/Admin/StatCard";
import {
  getLeaderboard,
  getTryoutStats,
  exportResults,
  LeaderboardEntry,
  TryoutStats,
} from "@/lib/api/AdminResultApi";
import { formatPtnTargetDisplay } from "@/lib/target";
import { ScoreDistributionChart } from "./components/ScoreDistributionChart";
import { RegistrantListTab } from "./components/RegistrantListTab";
import { toast } from "sonner";

interface AdminTryoutResultModuleProps {
  tryoutId: string;
}

const AdminTryoutResultModule: React.FC<AdminTryoutResultModuleProps> = ({
  tryoutId,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"registrants" | "leaderboard">("registrants");
  const [stats, setStats] = useState<TryoutStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, lbData] = await Promise.all([
        getTryoutStats(tryoutId),
        getLeaderboard(tryoutId, 1, 10),
      ]);
      setStats(statsData);
      setLeaderboard(lbData.data);
    } catch (error) {
      console.error(error);
      toast.error("Data ringkasan tryout gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [tryoutId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportType = activeTab === "registrants" ? "all" : "finished";
      const data = await exportResults(tryoutId, exportType);

      if (!data || data.length === 0) {
        toast.error("Belum ada data untuk diekspor.");
        return;
      }

      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row: any) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(","),
      );
      const csvContent = [headers, ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const fileLabel = activeTab === "registrants" ? "Registrant" : "Hasil";
      link.setAttribute(
        "download",
        `${fileLabel}_Tryout_${(stats?.title || "Tryout").replace(/\s+/g, "_")}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data berhasil diekspor ke CSV.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-[13px] font-medium text-text-muted">
          Memuat data peserta &amp; tryout...
        </span>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="p-8 bg-surface rounded-lg border border-border text-center text-danger font-medium">
        Data tryout tidak ditemukan.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-label text-primary">
              MANAJEMEN PESERTA &amp; REKAP
            </p>
            <h1 className="text-h2 font-bold text-text">
              {stats.title}
            </h1>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Ekspor CSV ({activeTab === "registrants" ? "Semua Registrant" : "Hasil Selesai"})
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          variant={activeTab === "registrants" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("registrants")}
          className="gap-2 text-xs font-semibold"
        >
          <Users className="w-4 h-4" />
          <span>Daftar Registrant &amp; Peserta</span>
        </Button>
        <Button
          variant={activeTab === "leaderboard" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("leaderboard")}
          className="gap-2 text-xs font-semibold"
        >
          <Trophy className="w-4 h-4" />
          <span>Hasil &amp; Peringkat IRT</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "registrants" ? (
        <RegistrantListTab tryoutId={tryoutId} />
      ) : (
        <div className="space-y-6">
          {/* 4-up Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="TOTAL SELESAI" value={stats.totalParticipants} />
            <StatCard
              label="RATA-RATA SKOR"
              value={Math.round(stats.averageScore)}
            />
            <StatCard
              label="SKOR TERTINGGI"
              value={Math.round(stats.highestScore)}
            />
            <StatCard
              label="SKOR TERENDAH"
              value={Math.round(stats.lowestScore)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScoreDistributionChart distribution={stats.distribution} />
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>10 peserta nilai tertinggi</CardTitle>
                  <CardDescription>
                    Peringkat nasional berdasarkan skor IRT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[70px]">Rank</TableHead>
                        <TableHead>Peserta</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead className="text-right">Skor IRT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-text-muted text-xs">
                            Belum ada peserta yang menyelesaikan tryout.
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaderboard.map((entry) => (
                          <TableRow key={entry.user.email}>
                            <TableCell className="font-mono text-xs font-medium">
                              {entry.rank <= 3 ? (
                                <Badge variant="signal">#{entry.rank}</Badge>
                              ) : (
                                `#${entry.rank}`
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-text text-sm">
                                {entry.user.name}
                              </div>
                              <div className="font-mono text-[11px] text-text-muted">
                                {entry.user.email}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {entry.user.target ? formatPtnTargetDisplay(entry.user.target) : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold text-text">
                              {Math.round(entry.totalScore)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTryoutResultModule;
