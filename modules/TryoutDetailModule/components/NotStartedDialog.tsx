"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTryoutScheduleDetails } from "@/lib/tryout-display";

export function NotStartedDialog({ open, onOpenChange, startDate, questionsUnavailable = false }: {
  open: boolean; onOpenChange: (open: boolean) => void; startDate: string; questionsUnavailable?: boolean;
}) {
  const start = formatTryoutScheduleDetails(startDate, null).startStr;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{questionsUnavailable ? "Soal sedang disiapkan" : "Tryout belum dimulai"}</DialogTitle>
        <DialogDescription>{questionsUnavailable ? "Soal tryout belum tersedia. Silakan kembali lagi nanti." : `Tryout mulai pada ${start}. Kamu bisa kembali ke halaman ini saat waktu pelaksanaan tiba.`}</DialogDescription>
      </DialogHeader>
      <DialogFooter><Button variant="primary" onClick={() => onOpenChange(false)}>Mengerti</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
