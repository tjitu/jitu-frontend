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
import { Switch } from "@/components/ui/switch";
import { Trash2, Pencil, Plus, Search } from "lucide-react";
import { StatCard } from "@/components/elements/Admin/StatCard";
import {
  getPackages,
  togglePackageStatus,
  deletePackage,
  TokenPackage,
} from "@/lib/api/AdminPackageApi";
import { toast } from "sonner";
import { PackageDialog } from "./components/PackageDialog";

const AdminPackageModule = () => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPkg, setSelectedPkg] = useState<TokenPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error(error);
      toast.error("Data paket kuota gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (id: string) => {
    try {
      await togglePackageStatus(id);
      toast.success("Status paket diubah.");
      fetchData();
    } catch {
      toast.error("Gagal mengubah status paket.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus paket ini? Tindakan ini tidak bisa dibatalkan."))
      return;
    try {
      await deletePackage(id);
      toast.success("Paket dihapus.");
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menghapus paket.";
      toast.error(errorMessage);
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b-2 border-blue-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            TOKO KUOTA
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Kelola paket kuota
          </h1>
          <p className="text-sm text-slate-700 mt-1">
            Atur jumlah kuota dan harga paket QRIS yang tampil di halaman Beli
            Kuota.
          </p>
        </div>
        <Button
          variant="default"
          onClick={() => {
            setSelectedPkg(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah paket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="TOTAL PAKET"
          value={packages.length}
          isLoading={isLoading}
        />
        <StatCard
          label="PAKET AKTIF"
          value={packages.filter((p) => p.isActive).length}
          isLoading={isLoading}
        />
        <StatCard
          label="NON-AKTIF"
          value={packages.filter((p) => !p.isActive).length}
          isLoading={isLoading}
        />
      </div>

      {/* Search */}
      <div className="bg-white border-2 border-blue-900 p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari nama paket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar paket kuota</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Paket</TableHead>
                <TableHead>Jumlah Kuota</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Terjual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center font-mono text-xs uppercase text-slate-500"
                  >
                    MEMUAT PAKET...
                  </TableCell>
                </TableRow>
              ) : filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-600"
                  >
                    Belum ada paket kuota.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-blue-900">
                      {p.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.tokenAmount} kuota
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-blue-900">
                      Rp{p.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p._count?.payments || 0}x
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={() => handleToggleStatus(p.id)}
                        />
                        <Badge variant={p.isActive ? "success" : "default"}>
                          {p.isActive ? "AKTIF" : "NON-AKTIF"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedPkg(p);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(p.id)}
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
        </CardContent>
      </Card>

      <PackageDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pkg={selectedPkg}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminPackageModule;
