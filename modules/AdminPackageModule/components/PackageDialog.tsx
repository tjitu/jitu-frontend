import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PackagePlus } from "lucide-react";
import {
  createPackage,
  updatePackage,
  TokenPackage,
} from "@/lib/api/AdminPackageApi";
import { toast } from "sonner";

interface PackageDialogProps {
  pkg: TokenPackage | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const PackageDialog: React.FC<PackageDialogProps> = ({
  pkg,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tokenAmount: "",
    price: "",
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        tokenAmount: pkg.tokenAmount.toString(),
        price: pkg.price.toString(),
      });
    } else {
      setFormData({
        name: "",
        tokenAmount: "",
        price: "",
      });
    }
  }, [pkg, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        tokenAmount: parseInt(formData.tokenAmount),
        price: parseInt(formData.price),
      };

      if (pkg) {
        await updatePackage(pkg.id, payload);
        toast.success("Paket berhasil diperbarui");
      } else {
        await createPackage(payload);
        toast.success("Paket baru berhasil dibuat");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan paket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            {pkg ? "Edit Paket" : "Tambah Paket Baru"}
          </DialogTitle>
          <DialogDescription>
            Atur nama, jumlah coin, dan harga paket.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pkg-name">Nama Paket</Label>
            <Input
              id="pkg-name"
              placeholder="Contoh: Paket Hemat"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-token">Jumlah Coin</Label>
              <Input
                id="pkg-token"
                type="number"
                placeholder="0"
                value={formData.tokenAmount}
                onChange={(e) =>
                  setFormData({ ...formData, tokenAmount: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Harga (Rp)</Label>
              <Input
                id="pkg-price"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pkg ? "Simpan Perubahan" : "Buat Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
