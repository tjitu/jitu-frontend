"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Eye, Trophy, Sparkles, Users } from "lucide-react";
import { StatCard } from "@/components/elements/Admin/StatCard";
import { AdminTryoutResponse, AdminTryoutStatsResponse } from "./interface";
import { getAllTryouts, getTryoutStats } from "@/lib/api/AdminTryoutApi";
import Link from "next/link";

const AdminTryoutModule = () => {
  const [valueStats, setValueStats] =
    useState<AdminTryoutStatsResponse | null>(null);

  const [tryouts, setTryouts] = useState<AdminTryoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, tryoutsData] = await Promise.all([
          getTryoutStats(),
          getAllTryouts(page),
        ]);
        setValueStats(statsData);
        if (tryoutsData.data) {
          setTryouts(tryoutsData.data);
          setPaginationMeta(tryoutsData.meta);
        } else {
          setTryouts(tryoutsData as AdminTryoutResponse[]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.lastPage) {
      setPage(newPage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return <Badge variant="success">Aktif</Badge>;
      case "NOT_STARTED":
        return <Badge variant="warn">Belum rilis</Badge>;
      case "FINISHED":
        return <Badge variant="default">Selesai</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b border-border">
        <div>
          <p className="text-label text-primary mb-1">
            MANAJEMEN UJIAN
          </p>
          <h1 className="text-h2 font-bold text-text">
            Daftar paket tryout
          </h1>
          <p className="text-[14px] text-text-muted mt-1">
            Kelola jadwal, subtes, dan bank soal tryout SNBT.
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/create-to">
            <Plus className="mr-2 h-4 w-4" />
            Buat tryout
          </Link>
        </Button>
      </div>

      {/* 4-up Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL TRYOUT"
          value={valueStats?.totalTryout ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          label="SEDANG AKTIF"
          value={valueStats?.totalActiveTryout ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          label="AKAN DATANG"
          value={valueStats?.totalUpcomingTryout ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          label="SELESAI"
          value={valueStats?.totalEndedTryout ?? 0}
          isLoading={isLoading}
        />
      </div>

      {/* Tryout Table */}
      <Card>
        <CardHeader>
          <CardTitle>Semua paket tryout</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nama Tryout</TableHead>
                <TableHead>Akses</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Coin</TableHead>
                <TableHead>Rilis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-[13px] font-medium text-text-muted"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : tryouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-text-muted"
                  >
                    Belum ada tryout yang dibuat.
                  </TableCell>
                </TableRow>
              ) : (
                tryouts.map((tryout) => (
                  <TableRow key={tryout.id}>
                    <TableCell className="font-mono text-xs font-medium text-text-muted">
                      #{tryout.code}
                    </TableCell>
                    <TableCell className="font-semibold text-text">
                      {tryout.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tryout.isPublic ? "default" : "warn"}
                      >
                        {tryout.isPublic ? "Publik" : "Privat"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-text">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3 text-text-muted" />
                        <span>{tryout.participantsCount ?? 0}</span>
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tryout.referralCode ? tryout.referralCode : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tryout.solutionPrice > 0
                        ? `${tryout.solutionPrice} coin`
                        : "Gratis"}
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {new Date(tryout.releaseDate).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(tryout.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Pratinjau"
                        >
                          <Link href={`/admin/tryout/${tryout.id}/preview`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Generator AI"
                        >
                          <Link
                            href={`/admin/ai-generator?tryoutId=${tryout.id}`}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Peserta & Hasil"
                        >
                          <Link href={`/admin/tryout/${tryout.id}/results`}>
                            <Users className="h-3.5 w-3.5 text-primary" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tryout/${tryout.id}`}>
                            Kelola
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>{page}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={
                      page >= paginationMeta.lastPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTryoutModule;
