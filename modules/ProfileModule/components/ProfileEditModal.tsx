"use client";

import { useState, type FormEvent } from "react";
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
import { SchoolPicker } from "@/components/ptn/SchoolPicker";
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

export function ProfileEditModal(props: ProfileEditModalProps) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      {props.isOpen && <ProfileEditModalContent {...props} />}
    </Dialog>
  );
}

function ProfileEditModalContent({
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({ name, phone, school, targets });
  };

  return (
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
              <SchoolPicker
                id="school"
                value={school}
                onChange={setSchool}
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
              Pilih kampus dan program studi aktif (maksimal 3 pilihan SNBT).
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
  );
}
