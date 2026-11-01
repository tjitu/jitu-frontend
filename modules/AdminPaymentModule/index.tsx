"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Check, X, Loader2 } from "lucide-react";
import { StatCard } from "@/components/elements/Admin/StatCard";
import { getPaymentStatsConfig } from "./const";
import { Payment, AdminPaymentStatsResponse } from "./interface";
import {
  getPayments,
  getPaymentStats,
  confirmPayment,
  rejectPayment,
} from "@/lib/api/AdminPaymentApi";
import { toast } from "sonner";

const AdminPaymentModule = () => {
  const [stats, setStats] = useState<AdminPaymentStatsResponse>({
    totalRevenue: 0,
    totalSuccess: 0,
    totalPending: 0,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, paymentsData] = await Promise.all([
        getPaymentStats(),
        getPayments(page, 10, filterStatus, debouncedSearch),
      ]);
      setStats(statsData);

      if (paymentsData.data) {
        setPayments(paymentsData.data);
        setPaginationMeta(paymentsData.meta);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Data pembayaran gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirm = async (id: string) => {
    if (
      !confirm(
        "Konfirmasi pembayaran ini? Coin akan otomatis ditambahkan ke akun peserta.",
      )
    )
      return;

    setIsActionLoading(id);
    try {
      await confirmPayment(id);
      toast.success("Pembayaran dikonfirmasi.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengonfirmasi pembayaran.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tolak pembayaran ini?")) return;

    setIsActionLoading(id);
    try {
      await rejectPayment(id);
      toast.success("Pembayaran ditolak.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menolak pembayaran.");
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Lunas</Badge>;
      case "PENDING":
        return <Badge variant="warn">Menunggu</Badge>;
      case "DECLINED":
      case "CANCELLED":
        return <Badge variant="danger">Batal</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.lastPage) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-border">
        <p className="text-label text-primary mb-1">
          KEUANGAN &amp; COIN
        </p>
        <h1 className="text-h2 font-bold text-text">
          Kelola pembayaran
        </h1>
        <p className="text-[14px] text-text-muted mt-1">
          Verifikasi transaksi QRIS dan pantau pendapatan paket coin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {getPaymentStatsConfig(
          stats.totalRevenue,
          stats.totalSuccess,
          stats.totalPending,
        ).map((stat, index) => (
          <StatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label>Cari transaksi</Label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
            <Input
              placeholder="Cari nama atau email peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-[220px]">
          <Label>Status pembayaran</Label>
          <Select
            value={filterStatus}
            onValueChange={(val) => {
              setFilterStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="CONFIRMED">Lunas</SelectItem>
              <SelectItem value="DECLINED">Batal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-[13px] font-medium text-text-muted"
                  >
                    Memuat transaksi...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-text-muted"
                  >
                    Belum ada transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-text-muted">
                      #{p.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-text text-sm">
                        {p.user.name}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted">
                        {p.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-text">
                        {p.tokenPackage.name}
                      </div>
                      <div className="font-mono text-xs text-primary">
                        {p.tokenAmount} coin
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-text">
                      Rp{p.amount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase">
                      {p.paymentMethod}
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      {p.status === "PENDING" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            title="Konfirmasi"
                            onClick={() => handleConfirm(p.id)}
                            disabled={isActionLoading === p.id}
                          >
                            {isActionLoading === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-success" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            title="Tolak"
                            onClick={() => handleReject(p.id)}
                            disabled={isActionLoading === p.id}
                          >
                            {isActionLoading === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
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

export default AdminPaymentModule;
