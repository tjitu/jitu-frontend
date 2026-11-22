"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export function StartTryoutDialog({ open, loading, onOpenChange, onConfirm }: {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>Mulai mengerjakan tryout?</DialogTitle>
          <DialogDescription>
            Waktu pengerjaan subtes pertama mulai berjalan setelah kamu menekan Mulai.
            Pastikan kamu siap dan koneksi internet tersedia.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>Batal</Button>
          <Button variant="primary" disabled={loading} onClick={onConfirm}>
            {loading ? "Memulai..." : "Mulai mengerjakan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
