"use client";

import React, { useState, useRef, useEffect } from "react";
import { UNIVERSITIES, getUniversityById, UniversityData } from "@/lib/universities-data";
import { UniversityLogo } from "../UniversityLogo";
import { Search, ChevronDown, Check, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PtnUniPickerProps {
  uniId?: string;
  onSelect: (uni: UniversityData) => void;
}

export function PtnUniPicker({ uniId, onSelect }: PtnUniPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUni = uniId ? getUniversityById(uniId) : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUnis = UNIVERSITIES.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.acronym.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[11px] font-medium text-text-muted mb-1 block">
        Universitas / PTN
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-2.5 rounded-md border border-border bg-surface text-text text-xs flex items-center justify-between gap-2 transition-all hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 cursor-pointer text-left",
          isOpen && "border-primary ring-2 ring-blue-100"
        )}
      >
        {currentUni ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Logo Uni di sebelah kiri nama */}
            <UniversityLogo
              logo={currentUni.logo}
              acronym={currentUni.acronym}
              size={22}
              className="shrink-0"
            />
            <span className="truncate font-semibold text-text text-xs">
              {currentUni.name}
            </span>
            <span className="text-text-muted text-[10px] font-mono shrink-0 font-bold">
              ({currentUni.acronym})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <GraduationCap size={16} className="shrink-0 text-text-muted" />
            <span>Pilih Universitas...</span>
          </div>
        )}
        <ChevronDown size={14} className="shrink-0 text-text-muted" />
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full min-w-[280px] sm:min-w-[320px] mt-1.5 rounded-lg border border-border bg-surface shadow-float overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="p-2 border-b border-border bg-surface-muted/50">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari universitas atau singkatan (UI, ITB, UB...)"
                className="w-full h-8 pl-8 pr-2.5 text-xs rounded bg-surface border border-border focus:outline-none focus:border-primary text-text placeholder:text-text-muted"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-border/30">
            {filteredUnis.length > 0 ? (
              filteredUnis.map((uni) => {
                const isSelected = uniId === uni.id;
                return (
                  <button
                    key={uni.id}
                    type="button"
                    onClick={() => {
                      onSelect(uni);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full px-2.5 py-2 rounded-md flex items-center gap-2.5 text-left text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-surface-muted text-text"
                    )}
                  >
                    {/* Logo Uni di sebelah kiri */}
                    <UniversityLogo
                      logo={uni.logo}
                      acronym={uni.acronym}
                      size={24}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{uni.name}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-muted text-text-muted shrink-0">
                      {uni.acronym}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-primary shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-text-muted">
                Universitas tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
