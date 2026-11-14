"use client";

import React from "react";
import { getUniversityById, UniversityData } from "@/lib/universities-data";
import { PtnChoice } from "@/lib/target";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { PtnUniPicker } from "./ptn/PtnUniPicker";
import { PtnProdiPicker } from "./ptn/PtnProdiPicker";

interface PtnTargetPickerProps {
  label: string;
  isPrimary?: boolean;
  choice: PtnChoice | null;
  onChange: (choice: PtnChoice | null) => void;
}

export function PtnTargetPicker({
  label,
  isPrimary = false,
  choice,
  onChange,
}: PtnTargetPickerProps) {
  const currentUni = choice?.uniId ? getUniversityById(choice.uniId) : undefined;

  const handleSelectUniversity = (uni: UniversityData) => {
    // If selecting a different university, retain jurusan if it exists in the new uni's programs
    const keepJurusan = choice?.jurusan && uni.programs.includes(choice.jurusan);
    onChange({
      uniId: uni.id,
      university: uni.name,
      acronym: uni.acronym,
      jurusan: keepJurusan ? choice.jurusan : "",
      logo: uni.logo,
    });
  };

  const handleSelectProdi = (prodi: string) => {
    if (!currentUni) return;
    onChange({
      uniId: currentUni.id,
      university: currentUni.name,
      acronym: currentUni.acronym,
      jurusan: prodi,
      logo: currentUni.logo,
    });
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="p-3.5 rounded-lg border border-border bg-surface-muted/30 space-y-3 transition-colors hover:border-border-strong">
      {/* Header Label & Clear */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-text flex items-center gap-1.5">
          <span>{label}</span>
          {isPrimary ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
              UTAMA
            </span>
          ) : (
            <span className="text-[10px] font-mono text-text-muted">OPSIONAL</span>
          )}
        </Label>
        {choice && !isPrimary && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-text-muted hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X size={12} />
            Hapus pilihan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Pemilihan Universitas dengan LOGO DI SEBELAH KIRI */}
        <PtnUniPicker
          uniId={choice?.uniId}
          onSelect={handleSelectUniversity}
        />

        {/* 2. Pemilihan Program Studi / Jurusan */}
        <PtnProdiPicker
          currentUni={currentUni}
          jurusan={choice?.jurusan || ""}
          onSelect={handleSelectProdi}
        />
      </div>
    </div>
  );
}
