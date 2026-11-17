"use client";

import { useState, useEffect } from "react";
import { Pencil, Lock, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversityLogo } from "@/components/UniversityLogo";
import { PtnTargetPicker } from "@/components/PtnTargetPicker";
import { PtnChoice, PtnTargets } from "@/lib/target";

interface ProfileSettingsTabProps {
  user: {
    name: string;
    email: string;
    phone: string;
    school: string;
  };
  ptnTargets: PtnTargets;
  onOpenEditModal: () => void;
  onOpenPasswordModal: () => void;
  onSaveTargets: (targets: PtnTargets) => Promise<void>;
  isSavingTargets: boolean;
  isInitialEditingTargets?: boolean;
}

export function ProfileSettingsTab({
  user,
  ptnTargets,
  onOpenEditModal,
  onOpenPasswordModal,
  onSaveTargets,
  isSavingTargets,
  isInitialEditingTargets = false,
}: ProfileSettingsTabProps) {
  const [isEditingTargets, setIsEditingTargets] = useState(isInitialEditingTargets);
  const [draftTargets, setDraftTargets] = useState<PtnTargets>(ptnTargets);

  useEffect(() => {
    setDraftTargets(ptnTargets);
  }, [ptnTargets]);

  useEffect(() => {
    if (isInitialEditingTargets) {
      setIsEditingTargets(true);
    }
  }, [isInitialEditingTargets]);

  const targetSlots: Array<{ label: string; key: keyof PtnTargets; choice: PtnChoice | null }> = [
    { label: "Pilihan 1", key: "pilihan1", choice: ptnTargets.pilihan1 },
    { label: "Pilihan 2", key: "pilihan2", choice: ptnTargets.pilihan2 },
    { label: "Pilihan 3", key: "pilihan3", choice: ptnTargets.pilihan3 },
  ];

  const handleStartEdit = () => {
    setDraftTargets(ptnTargets);
    setIsEditingTargets(true);
  };

  const handleCancelEdit = () => {
    setDraftTargets(ptnTargets);
    setIsEditingTargets(false);
  };

  const handleSaveInlineTargets = async () => {
    await onSaveTargets(draftTargets);
    setIsEditingTargets(false);
  };

  return (
    <div className="bg-surface border border-border rounded-lg divide-y divide-border">
      {/* Header & Personal Info */}
      <div className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-text">Pengaturan akun</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Data diri dan informasi akademik yang terhubung ke akunmu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEditModal}
            className="self-start sm:self-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Ubah profil
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-1">
          <div className="space-y-1">
            <div className="text-xs font-medium text-text-muted">
              Nama lengkap
            </div>
            <div className="text-sm font-semibold text-text">
              {user.name}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-text-muted">
              Email terdaftar
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-text">{user.email}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                Aktif
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-text-muted">
              Nomor HP / WhatsApp
            </div>
            <div className="text-sm font-semibold text-text">
              {user.phone ? (
                <span className="font-mono">{user.phone}</span>
              ) : (
                <span className="text-text-muted font-normal">Belum diisi</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-text-muted">
              Asal sekolah
            </div>
            <div className="text-sm font-semibold text-text">
              {user.school ? (
                user.school
              ) : (
                <span className="text-text-muted font-normal">Belum diisi</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Target PTN & Program Studi (Inline Editing) */}
      <div id="target-ptn-section" className="p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-text">
              Target PTN &amp; Program Studi
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Pilihan kampus dan jurusan untuk rasionalisasi peluang SNBT
            </p>
          </div>
          {!isEditingTargets && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="text-xs font-semibold text-primary gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Ubah target
            </Button>
          )}
        </div>

        {isEditingTargets ? (
          <div className="space-y-3 pt-1">
            <PtnTargetPicker
              label="Pilihan 1"
              isPrimary
              choice={draftTargets.pilihan1}
              onChange={(choice: PtnChoice | null) =>
                setDraftTargets((prev) => ({ ...prev, pilihan1: choice }))
              }
            />

            <PtnTargetPicker
              label="Pilihan 2"
              choice={draftTargets.pilihan2}
              onChange={(choice: PtnChoice | null) =>
                setDraftTargets((prev) => ({ ...prev, pilihan2: choice }))
              }
            />

            <PtnTargetPicker
              label="Pilihan 3"
              choice={draftTargets.pilihan3}
              onChange={(choice: PtnChoice | null) =>
                setDraftTargets((prev) => ({ ...prev, pilihan3: choice }))
              }
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleCancelEdit}
                disabled={isSavingTargets}
              >
                Batal
              </Button>
              <Button
                variant="default"
                size="sm"
                type="button"
                onClick={handleSaveInlineTargets}
                disabled={isSavingTargets}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {isSavingTargets ? "Menyimpan..." : "Simpan target"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/70 border border-border rounded-lg bg-surface-muted/30">
            {targetSlots.map(({ label, choice }) => (
              <div
                key={label}
                className="px-4 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {choice ? (
                    <>
                      <UniversityLogo
                        logo={choice.logo}
                        acronym={choice.acronym}
                        size={28}
                      />
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-text leading-snug truncate">
                          {choice.university}
                          {choice.acronym && choice.acronym !== choice.university
                            ? ` (${choice.acronym})`
                            : ""}
                        </div>
                        <div className="text-sm text-text-body truncate">
                          {choice.jurusan}
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Atur pilihan ini
                    </button>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium text-text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keamanan Akun */}
      <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-text">Keamanan akun</h4>
          <p className="text-xs text-text-muted mt-0.5">
            Perbarui password secara berkala untuk menjaga keamanan akunmu
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPasswordModal}
          className="self-start sm:self-center gap-2"
        >
          <Lock className="w-3.5 h-3.5" />
          Ubah password
        </Button>
      </div>
    </div>
  );
}
