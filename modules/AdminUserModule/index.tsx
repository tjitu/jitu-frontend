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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2, Coins, Eye, Settings, Search } from "lucide-react";
import { StatCard } from "@/components/elements/Admin/StatCard";
import { getStatsConfig } from "./const";
import { AdminUserResponse, AdminUserStatsResponse } from "./interface";
import { getAllUsers, getUserStats, deleteUser } from "@/lib/api/AdminUserApi";
import { toast } from "sonner";
import { TokenAdjustmentDialog } from "./components/TokenAdjustmentDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminUserModule = () => {
  const [stats, setStats] = useState<AdminUserStatsResponse>({
    totalUser: 0,
    activeUser: 0,
    totalAdmin: 0,
  });
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [selectedUserForToken, setSelectedUserForToken] =
    useState<AdminUserResponse | null>(null);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);

  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<AdminUserResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const role = roleFilter === "ALL" ? undefined : roleFilter;
      const [statsData, usersData] = await Promise.all([
        getUserStats(),
        getAllUsers(page, 10, search, role),
      ]);
      setStats(statsData);

      if (usersData.data) {
        setUsers(usersData.data);
        setPaginationMeta(usersData.meta);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Data gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus akun peserta ini secara permanen?")) return;

    try {
      await deleteUser(id);
      toast.success("Akun peserta dihapus.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus akun.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationMeta.lastPage) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b-2 border-blue-900">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
          DATA PENGGUNA
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
          Kelola peserta
        </h1>
        <p className="text-sm text-slate-700 mt-1">
          Pantau akun peserta, target kampus, dan saldo coin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {getStatsConfig(
          stats.totalUser,
          stats.activeUser,
          stats.totalAdmin,
        ).map((stat, index) => (
          <StatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-2 border-blue-900 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari nama atau email peserta..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua peran</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">Peserta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar akun ({paginationMeta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Coin</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center font-mono text-xs uppercase text-slate-500"
                  >
                    MEMUAT DATA...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-slate-600"
                  >
                    Tidak ada peserta yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {(page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-xs">
                      {user.target || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "primary" : "default"}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-blue-900">
                      {user.tokenBalance} coin
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Detail peserta"
                        >
                          <Link href={`/admin/user/${user.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Sesuaikan coin"
                          onClick={() => {
                            setSelectedUserForToken(user);
                            setIsTokenDialogOpen(true);
                          }}
                        >
                          <Coins className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          title="Ubah profil"
                          onClick={() => {
                            setSelectedUserForEdit(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          title="Hapus"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      <TokenAdjustmentDialog
        isOpen={isTokenDialogOpen}
        onOpenChange={setIsTokenDialogOpen}
        userId={selectedUserForToken?.id || null}
        userName={selectedUserForToken?.name}
        onSuccess={() => {
          fetchData();
          setSelectedUserForToken(null);
        }}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUserForEdit}
        onSuccess={() => {
          fetchData();
          setSelectedUserForEdit(null);
        }}
      />
    </div>
  );
};

export default AdminUserModule;
