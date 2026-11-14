"use client";

import React, { useState } from "react";
import { UNIVERSITIES, getUniversityById } from "@/lib/universities-data";
import { PtnChoice } from "@/lib/target";
import { UniversityLogo } from "./UniversityLogo";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X, Check } from "lucide-react";

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
  const [isCustomJurusan, setIsCustomJurusan] = useState(false);
  const [customJurusanText, setCustomJurusanText] = useState("");

  const currentUni = choice?.uniId ? getUniversityById(choice.uniId) : undefined;
  const programs = currentUni?.programs || [];

  const handleUniversityChange = (uniId: string) => {
    if (!uniId) {
      onChange(null);
      return;
    }
    const uni = getUniversityById(uniId);
    if (!uni) return;

    setIsCustomJurusan(false);
    onChange({
      uniId: uni.id,
      university: uni.name,
      acronym: uni.acronym,
      jurusan: "",
      logo: uni.logo,
    });
  };

  const handleJurusanChange = (jurusan: string) => {
    if (jurusan === "__custom__") {
      setIsCustomJurusan(true);
      return;
    }
    if (!currentUni) return;
    setIsCustomJurusan(false);
    onChange({
      uniId: currentUni.id,
      university: currentUni.name,
      acronym: currentUni.acronym,
      jurusan,
      logo: currentUni.logo,
    });
  };

  const handleCustomJurusanSubmit = (text: string) => {
    setCustomJurusanText(text);
    if (!currentUni) return;
    onChange({
      uniId: currentUni.id,
      university: currentUni.name,
      acronym: currentUni.acronym,
      jurusan: text.trim(),
      logo: currentUni.logo,
    });
  };

  const handleClear = () => {
    setIsCustomJurusan(false);
    setCustomJurusanText("");
    onChange(null);
  };

  return (
    <div className="p-3.5 rounded-lg border border-border bg-surface-muted/40 space-y-3 transition-colors hover:border-border-strong">
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
        {/* 1. Pilih Universitas dengan logo disamping kiri */}
        <div>
          <label className="text-[11px] font-medium text-text-muted mb-1 block">
            Universitas / PTN
          </label>
          <Select
            value={choice?.uniId || ""}
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger className="w-full text-xs h-10 px-2.5">
              <SelectValue placeholder="Pilih Universitas">
                {currentUni && (
                  <div className="flex items-center gap-2 truncate">
                    <UniversityLogo
                      logo={currentUni.logo}
                      acronym={currentUni.acronym}
                      size={20}
                    />
                    <span className="truncate font-medium">{currentUni.name}</span>
                    <span className="text-text-muted text-[11px] font-mono">
                      ({currentUni.acronym})
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-60">
              {UNIVERSITIES.map((uni) => (
                <SelectItem key={uni.id} value={uni.id} className="text-xs py-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <UniversityLogo
                      logo={uni.logo}
                      acronym={uni.acronym}
                      size={20}
                    />
                    <span className="truncate font-medium">{uni.name}</span>
                    <span className="text-text-muted text-[11px] font-mono">
                      ({uni.acronym})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. Pilih Jurusan (aktif setelah pilih universitas) */}
        <div>
          <label className="text-[11px] font-medium text-text-muted mb-1 block">
            Program Studi / Jurusan
          </label>
          {isCustomJurusan ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={customJurusanText || choice?.jurusan || ""}
                onChange={(e) => handleCustomJurusanSubmit(e.target.value)}
                placeholder="Tulis nama program studi..."
                className="text-xs h-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsCustomJurusan(false)}
                className="h-10 px-2 text-xs border border-border rounded-md hover:bg-surface-muted text-text-muted shrink-0"
                title="Pilih dari daftar"
              >
                Pilih
              </button>
            </div>
          ) : (
            <Select
              value={choice?.jurusan || ""}
              onValueChange={handleJurusanChange}
              disabled={!currentUni}
            >
              <SelectTrigger
                className="w-full text-xs h-10 px-2.5"
                disabled={!currentUni}
              >
                <SelectValue
                  placeholder={
                    currentUni
                      ? "Pilih Program Studi"
                      : "Pilih universitas dulu"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60">
                {programs.map((prog) => (
                  <SelectItem key={prog} value={prog} className="text-xs py-2">
                    {prog}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__custom__"
                  className="text-xs py-2 text-primary font-medium border-t border-border mt-1"
                >
                  ✏️ Jurusan lainnya (Ketik sendiri)...
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
