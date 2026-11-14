"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Loader2, UserCheck, Clock, CheckCircle2, Play } from "lucide-react";
import { getRegistrants, RegistrantEntry } from "@/lib/api/AdminResultApi";
import { formatPtnTargetDisplay } from "@/lib/target";

interface RegistrantListTabProps {
  tryoutId: string;
}

type StatusFilter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";

export function RegistrantListTab({ tryoutId }: RegistrantListTabProps) {
  const [registrants, setRegistrants] = useState<RegistrantEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    all: 0,
    notStarted: 0,
    inProgress: 0,
    finished: 0,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRegistrants = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRegistrants(tryoutId, page, 20, status, debouncedSearch);
      setRegistrants(res.data);
      setCounts(res.counts);
      setTotal(res.meta.total);
      setLastPage(res.meta.lastPage);
    } catch (err) {
      console.error("Failed to fetch registrants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tryoutId, page, status, debouncedSearch]);

  useEffect(() => {
    fetchRegistrants();
  }, [fetchRegistrants]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "FINISHED":
        return (
          <Badge variant="success" className="gap-1 font-mono text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai</span>
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="signal" className="gap-1 font-mono text-[11px]">
            <Play className="w-3 h-3 fill-current" />
            <span>Mengerjakan</span>
          </Badge>
        );
      case "NOT_STARTED":
      default:
        return (
          <Badge variant="warn" className="gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Belum Mulai</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            size="sm"
            variant={status === "ALL" ? "default" : "outline"}
            onClick={() => {
              setStatus("ALL");
              setPage(1);
            }}
            className="text-xs h-8"
          >
            Semua ({counts.all})
          </Button>
          <Button
            size="sm"
            variant={status === "NOT_STARTED" ? "default" : "outline"}
            onClick={() => {
              setStatus("NOT_STARTED");
              setPage(1);
            }}
            className="text-xs h-8"
          >
            Belum Mulai ({counts.notStarted})
          </Button>
          <Button
            size="sm"
            variant={status === "IN_PROGRESS" ? "default" : "outline"}
            onClick={() => {
              setStatus("IN_PROGRESS");
              setPage(1);
            }}
            className="text-xs h-8"
          >
            Mengerjakan ({counts.inProgress})
          </Button>
          <Button
            size="sm"
            variant={status === "FINISHED" ? "default" : "outline"}
            onClick={() => {
              setStatus("FINISHED");
              setPage(1);
            }}
            className="text-xs h-8"
          >
            Selesai ({counts.finished})
          </Button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Registrants Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">No</TableHead>
              <TableHead>Peserta</TableHead>
              <TableHead>Target PTN &amp; Jurusan</TableHead>
              <TableHead>Waktu Terdaftar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Skor IRT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-text-muted text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Memuat daftar registrant...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : registrants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-text-muted text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UserCheck className="h-6 w-6 text-text-muted stroke-[1.5]" />
                    <span>
                      {search ? "Tidak ada peserta yang cocok dengan pencarian." : "Belum ada siswa yang mendaftar tryout ini."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              registrants.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-text-muted">
                    {(page - 1) * 20 + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-text text-sm">
                      {item.user?.name || "Peserta"}
                    </div>
                    <div className="font-mono text-[11px] text-text-muted">
                      {item.user?.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.user?.target ? formatPtnTargetDisplay(item.user.target) : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-text-muted whitespace-nowrap">
                    {new Date(item.startedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-text">
                    {item.status === "FINISHED" ? Math.round(item.totalScore) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>
            Menampilkan {registrants.length} dari {total} pendaftar
          </span>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < lastPage && setPage(page + 1)}
                  className={page >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
