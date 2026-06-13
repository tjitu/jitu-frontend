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
import { Plus, Eye, Trophy, Sparkles } from "lucide-react";
import { stats } from "./const";
import { AdminTryoutResponse, AdminTryoutStatsResponse } from "./interface";
import { getAllTryouts, getTryoutStats } from "@/lib/api/AdminTryoutApi";
import Link from "next/link";

const AdminTryoutModule = () => {
  const [valueStats, setValueStats] = useState<AdminTryoutStatsResponse | null>(
    null
  );

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
        // Handle paginated response structure
        if (tryoutsData.data) {
          setTryouts(tryoutsData.data);
          setPaginationMeta(tryoutsData.meta);
        } else {
          // Fallback if backend hasn't deployed changes yet (unlikely but safe)
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
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
            Aktif
          </Badge>
        );
      case "NOT_STARTED":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 shadow-none"
          >
            Belum Rilis
          </Badge>
        );
      case "FINISHED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-white hover:bg-red-200 border-red-200 shadow-none"
          >
            Selesai
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Kelola Tryout
          </h1>
          <p className="text-muted-foreground">
            Pantau statistik dan kelola semua tryout UTBK dalam satu tempat.
          </p>
        </div>
        <Link href={"create-to"}>
          <Button className="font-semibold shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Buat Tryout Baru
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          let value = 0;
          if (valueStats) {
            if (stat.label === "TOTAL TRYOUT") value = valueStats.totalTryout;
            else if (stat.label === "TRYOUT AKTIF")
              value = valueStats.totalActiveTryout;
            else if (stat.label === "SELESAI")
              value = valueStats.totalEndedTryout;
            else value = valueStats.totalUpcomingTryout;
          }

          return (
            <Card
              key={index}
              className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? "-" : value}
                </div>
                {stat.suffix && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.suffix}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tryout Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Tryout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nama Tryout</TableHead>
                  <TableHead>Akses</TableHead>
                  <TableHead>Referral</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Tanggal Rilis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : tryouts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Belum ada tryout yang dibuat.
                    </TableCell>
                  </TableRow>
                ) : (
                  tryouts.map((tryout) => (
                    <TableRow key={tryout.id}>
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                        #{tryout.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tryout.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tryout.isPublic ? "outline" : "secondary"}
                          className={
                            tryout.isPublic
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : "text-orange-600 border-orange-200 bg-orange-50"
                          }
                        >
                          {tryout.isPublic ? "Publik" : "Privat"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tryout.referralCode ? (
                          <code className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded">
                            {tryout.referralCode}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tryout.solutionPrice > 0 ? (
                          <div className="flex items-center gap-1 font-medium text-amber-600">
                            <span>
                              {tryout.solutionPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px]">Token</span>
                          </div>
                        ) : (
                          <span className="text-green-600 font-medium">
                            Gratis
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(tryout.releaseDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tryout.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/tryout/${tryout.id}/preview`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-purple-600 border-purple-200 hover:bg-purple-50"
                              title="Preview Tryout"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/ai-generator?tryoutId=${tryout.id}`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                              title="Generate soal dengan AI"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </Link>
                          {tryout.status === "FINISHED" ? (
                            <Link href={`/admin/tryout/${tryout.id}/results`}>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                title="Lihat Leaderboard"
                              >
                                <Trophy className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-50 cursor-not-allowed border-muted"
                              title="Hasil hanya tersedia setelah tryout selesai"
                              disabled
                            >
                              <Trophy className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/admin/tryout/${tryout.id}`}>
                            <Button variant="outline" size="sm" className="h-8">
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              Detail
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
                {/* Simple pagination logic: just showing current page for now or simple range could be added */}
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
