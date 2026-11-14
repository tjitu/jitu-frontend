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

export interface ProfileSavePayload {
  name: string;
  phone: string;
  school: string;
  targets: PtnTargets;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialPhone: string;
  initialSchool: string;
  initialTargets: PtnTargets;
  onSave: (payload: ProfileSavePayload) => Promise<void>;
  isSaving: boolean;
}

export function ProfileEditModal({
  isOpen,
  onOpenChange,
  initialName,
  initialPhone,
  initialSchool,
  initialTargets,
  onSave,
  isSaving,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [school, setSchool] = useState(initialSchool);
  const [targets, setTargets] = useState<PtnTargets>(initialTargets);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone(initialPhone);
      setSchool(initialSchool);
      setTargets(initialTargets);
    }
  }, [isOpen, initialName, initialPhone, initialSchool, initialTargets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name, phone, school, targets });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ubah profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-3.5">
            <div>
              <Label htmlFor="name" className="text-xs font-semibold">
                Nama lengkap
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className="mt-1.5"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Nomor HP / WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="school" className="text-xs font-semibold">
                  Asal sekolah
                </Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Contoh: SMAN 8 Jakarta"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <Label className="text-sm font-semibold text-text">
                Target PTN &amp; Program Studi
              </Label>
              <p className="text-xs text-text-muted mt-0.5">
                Pilih kampus dan program studi impianmu (maksimal 3 pilihan SNBT).
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
