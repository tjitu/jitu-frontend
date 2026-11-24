"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { restartSandboxTryout } from "@/lib/api/exam";
import { invalidateDashboardCache } from "@/lib/api/DashboardApi";
import { invalidateTryoutCatalogCache } from "@/modules/TryoutModule";

export function SandboxRestartButton({ tryoutId, attemptId, title }: {
  tryoutId: string; attemptId: string; title: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function restart() {
    setBusy(true);
    setError("");
    try {
      await restartSandboxTryout(tryoutId, attemptId);
      invalidateDashboardCache();
      invalidateTryoutCatalogCache();
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memulai ulang tryout.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" className="shrink-0 self-start sm:self-center" onClick={() => { setError(""); setOpen(true); }}>
        <RotateCcw aria-hidden="true" /> Mulai ulang tryout
      </Button>
      <Dialog open={open} onOpenChange={busy ? undefined : setOpen}>
        <DialogContent showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle>Ulangi {title} dari awal?</DialogTitle>
            <DialogDescription>
              Jawaban dan nilai sandbox kamu untuk tryout ini akan dihapus. Akses pembahasan tetap tersedia sesuai pendaftaranmu. Waktu subtes berjalan saat kamu mulai mengerjakan lagi.
            </DialogDescription>
          </DialogHeader>
          {error && <p role="alert" className="text-sm text-danger-text">{error}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Batal</Button>
            <Button variant="primary" disabled={busy} onClick={restart}>{busy ? "Mengulang…" : "Mulai ulang"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
