"use client";

import { Pencil, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversityLogo } from "@/components/UniversityLogo";
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
}

export function ProfileSettingsTab({
  user,
  ptnTargets,
  onOpenEditModal,
  onOpenPasswordModal,
}: ProfileSettingsTabProps) {
  const targetSlots: Array<{ label: string; choice: PtnChoice | null }> = [
    { label: "Pilihan 1", choice: ptnTargets.pilihan1 },
    { label: "Pilihan 2", choice: ptnTargets.pilihan2 },
    { label: "Pilihan 3", choice: ptnTargets.pilihan3 },
  ];

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

      {/* Target PTN & Program Studi */}
      <div className="p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-text">
              Target PTN &amp; Program Studi
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Pilihan kampus dan jurusan untuk rasionalisasi peluang SNBT
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenEditModal}
            className="text-xs font-semibold text-primary"
          >
            Ubah target
          </Button>
        </div>

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
                  <div className="text-sm text-text-muted">
                    Belum diatur
                  </div>
                )}
              </div>
              <span className="shrink-0 text-xs font-medium text-text-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
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
