"use client";

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

export interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfilePasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasPassword: boolean;
  passwordForm: PasswordFormState;
  onChangePasswordForm: (next: PasswordFormState) => void;
  onSubmit: () => Promise<void>;
  isSaving: boolean;
}

export function ProfilePasswordModal({
  isOpen,
  onOpenChange,
  hasPassword,
  passwordForm,
  onChangePasswordForm,
  onSubmit,
  isSaving,
}: ProfilePasswordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah password</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          {hasPassword && (
            <div className="space-y-1.5">
              <Label>Password saat ini</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  onChangePasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Password baru</Label>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              value={passwordForm.newPassword}
              onChange={(e) =>
                onChangePasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ulangi password baru</Label>
            <Input
              type="password"
              placeholder="Ketik ulang password baru"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                onChangePasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Batal
            </Button>
          </DialogClose>
          <Button variant="default" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
