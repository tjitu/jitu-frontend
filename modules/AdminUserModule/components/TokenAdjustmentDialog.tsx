import React, { useState } from "react";
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
import { Loader2, Coins } from "lucide-react";
import {
  manualTokenAdjustment,
  TopupTokenPayload,
} from "@/lib/api/AdminUserApi";
import { toast } from "sonner";

interface TokenAdjustmentDialogProps {
  userId: string | null;
  userName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const TokenAdjustmentDialog: React.FC<TokenAdjustmentDialogProps> = ({
  userId,
  userName,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount || !description) {
      toast.error("Isi jumlah coin dan keterangan.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: TopupTokenPayload = {
        amount: Number(amount),
        description,
      };
      await manualTokenAdjustment(userId, payload);
      toast.success("Saldo coin berhasil diubah.");
      onSuccess();
      onOpenChange(false);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah saldo coin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Kelola coin manual
          </DialogTitle>
          <DialogDescription>
            Ubah saldo coin untuk peserta <strong>{userName}</strong>. Gunakan
            angka negatif untuk mengurangi saldo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Coin</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Contoh: 10 atau -5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              (+) Tambah saldo, (-) Kurangi saldo
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan (wajib)</Label>
            <Input
              id="description"
              placeholder="Contoh: Bonus referral, koreksi saldo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
