"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PtnTargetPicker } from "@/components/PtnTargetPicker";
import { PtnChoice, PtnTargets } from "@/lib/target";

interface ProfileEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialTargets: PtnTargets;
  onSave: (name: string, targets: PtnTargets) => Promise<void>;
  isSaving: boolean;
}

export function ProfileEditModal({
  isOpen,
  onOpenChange,
  initialName,
  initialTargets,
  onSave,
  isSaving,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialName);
  const [targets, setTargets] = useState<PtnTargets>(initialTargets);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setTargets(initialTargets);
    }
  }, [isOpen, initialName, initialTargets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name, targets);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ubah profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name" className="text-xs font-semibold">
              Nama lengkap
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap kamu"
              className="mt-1"
              required
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            <div>
              <Label className="text-sm font-semibold text-text">
                Target PTN &amp; Program Studi
              </Label>
              <p className="text-xs text-text-muted mt-0.5">
                Pilih universitas impian (dengan logo di samping kiri), lalu tentukan program studi.
                Kamu dapat memilih hingga 3 pilihan untuk simulasi SNBT.
              </p>
            </div>

            <PtnTargetPicker
              label="Pilihan 1"
              isPrimary
              choice={targets.pilihan1}
              onChange={(choice: PtnChoice | null) =>
                setTargets((prev) => ({ ...prev, pilihan1: choice }))
              }
            />

            <PtnTargetPicker
              label="Pilihan 2"
              choice={targets.pilihan2}
              onChange={(choice: PtnChoice | null) =>
                setTargets((prev) => ({ ...prev, pilihan2: choice }))
              }
            />

            <PtnTargetPicker
              label="Pilihan 3"
              choice={targets.pilihan3}
              onChange={(choice: PtnChoice | null) =>
                setTargets((prev) => ({ ...prev, pilihan3: choice }))
              }
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Batal
              </Button>
            </DialogClose>
            <Button variant="default" type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
