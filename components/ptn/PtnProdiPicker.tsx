"use client";

import React, { useState, useRef, useEffect } from "react";
import { UniversityData } from "@/lib/universities-data";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Check, BookOpen, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PtnProdiPickerProps {
  currentUni?: UniversityData;
  jurusan: string;
  onSelect: (prodi: string) => void;
}

export function PtnProdiPicker({
  currentUni,
  jurusan,
  onSelect,
}: PtnProdiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const programs = currentUni?.programs || [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProdis = programs.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.toLowerCase().includes(q);
  });

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-text-muted block">
          Program Studi / Jurusan
        </label>
        {currentUni && !isCustom && (
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <Edit2 size={10} />
            Ketik manual
          </button>
        )}
      </div>

      {!currentUni ? (
        <div className="w-full h-10 px-2.5 rounded-md border border-border bg-surface-muted/60 text-text-muted text-xs flex items-center gap-2 select-none">
          <BookOpen size={15} className="shrink-0 opacity-50" />
          <span className="italic">Pilih universitas dulu</span>
        </div>
      ) : isCustom ? (
        <div className="flex items-center gap-1.5">
          <Input
            value={jurusan}
            onChange={(e) => onSelect(e.target.value)}
            placeholder="Tulis nama program studi..."
            className="text-xs h-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            className="h-10 px-2 text-[11px] border border-border rounded-md hover:bg-surface-muted text-text-muted shrink-0 cursor-pointer whitespace-nowrap"
            title="Pilih dari daftar resmi"
          >
            Daftar
          </button>
        </div>
      ) : (
        <>
          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full h-10 px-2.5 rounded-md border border-border bg-surface text-text text-xs flex items-center justify-between gap-2 transition-all hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 cursor-pointer text-left",
              isOpen && "border-primary ring-2 ring-blue-100"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <BookOpen size={15} className="shrink-0 text-text-muted" />
              <span
                className={cn(
                  "truncate text-xs",
                  jurusan ? "font-medium text-text" : "text-text-muted"
                )}
              >
                {jurusan || "Pilih Program Studi..."}
              </span>
            </div>
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
                    placeholder="Cari program studi (Kedokteran, Informatika...)"
                    className="w-full h-8 pl-8 pr-2.5 text-xs rounded bg-surface border border-border focus:outline-none focus:border-primary text-text placeholder:text-text-muted"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-1 divide-y divide-border/30">
                {filteredProdis.length > 0 ? (
                  filteredProdis.map((prog) => {
                    const isSelected = jurusan === prog;
                    return (
                      <button
                        key={prog}
                        type="button"
                        onClick={() => {
                          onSelect(prog);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={cn(
                          "w-full px-2.5 py-2 rounded-md flex items-center justify-between text-left text-xs transition-colors cursor-pointer",
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-surface-muted text-text"
                        )}
                      >
                        <span className="truncate">{prog}</span>
                        {isSelected && (
                          <Check size={14} className="text-primary shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-3 text-center text-xs text-text-muted">
                    Jurusan tidak ditemukan di daftar resmi
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCustom(true);
                  }}
                  className="w-full px-2.5 py-2 text-left text-xs text-primary hover:bg-blue-50/50 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Ketik jurusan lainnya secara manual...</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
