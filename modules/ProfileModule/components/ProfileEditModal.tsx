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

export interface ProfileSavePayload {
  name: string;
  phone: string;
  school: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  email: string;
  initialPhone: string;
  initialSchool: string;
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
  email,
  initialPhone,
  initialSchool,
  onSave,
  isSaving,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [school, setSchool] = useState(initialSchool);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({ name, phone, school });
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
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

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email terdaftar
              </Label>
              <span className="text-[10px] font-medium text-text-muted">
                Tidak dapat diubah
              </span>
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              readOnly
              className="mt-1.5 bg-surface-muted/70 text-text-muted cursor-not-allowed select-none opacity-80"
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

        <DialogFooter className="gap-2 pt-3 border-t border-border mt-5">
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
