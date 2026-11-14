"use client";

import { useState, useRef, useEffect } from "react";
import { UniversityData } from "@/lib/universities-data";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Check, BookOpen, Edit2, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramOption {
  programCode?: string;
  name: string;
  degreeLevel?: string;
  accreditation?: string;
}

interface PtnProdiPickerProps {
  currentUni?: UniversityData;
  jurusan: string;
  onSelect: (prodi: string) => void;
}

function programLabel(program: ProgramOption): string {
  return program.degreeLevel
    ? `${program.name} · ${program.degreeLevel}`
    : program.name;
}

export function PtnProdiPicker({
  currentUni,
  jurusan,
  onSelect,
}: PtnProdiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [programs, setPrograms] = useState<ProgramOption[]>(() =>
    currentUni && !currentUni.campusCode
      ? (currentUni.programs ?? []).map((name) => ({ name }))
      : [],
  );
  const [isLoading, setIsLoading] = useState(Boolean(currentUni?.campusCode));
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const campusCode = currentUni?.campusCode;

  useEffect(() => {
    if (!campusCode) return;

    const controller = new AbortController();
    fetch(`/api/catalog/ptn-programs?campusCode=${encodeURIComponent(campusCode)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal memuat program studi.");
        return (await response.json()) as { programs: ProgramOption[] };
      })
      .then((data) => setPrograms(data.programs))
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [campusCode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = search.trim().toLocaleLowerCase("id-ID");
  const filteredPrograms = programs.filter((program) =>
    `${program.name} ${program.degreeLevel ?? ""} ${program.accreditation ?? ""}`
      .toLocaleLowerCase("id-ID")
      .includes(query),
  );

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
            onChange={(event) => onSelect(event.target.value)}
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
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className={cn(
              "w-full h-10 px-2.5 rounded-md border border-border bg-surface text-text text-xs flex items-center justify-between gap-2 transition-all hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 cursor-pointer text-left",
              isOpen && "border-primary ring-2 ring-blue-100",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <BookOpen size={15} className="shrink-0 text-text-muted" />
              <span
                className={cn(
                  "truncate text-xs",
                  jurusan ? "font-medium text-text" : "text-text-muted",
                )}
              >
                {jurusan || "Pilih Program Studi..."}
              </span>
            </div>
            {isLoading ? (
              <LoaderCircle size={14} className="shrink-0 animate-spin text-text-muted" />
            ) : (
              <ChevronDown size={14} className="shrink-0 text-text-muted" />
            )}
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 z-50 w-full min-w-0 mt-1.5 rounded-lg border border-border bg-surface shadow-float overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="p-2 border-b border-border bg-surface-muted/50">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-2.5 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari program studi..."
                    aria-label="Cari program studi"
                    className="w-full h-8 pl-8 pr-2.5 text-xs rounded bg-surface border border-border focus:outline-none focus:border-primary text-text placeholder:text-text-muted"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-1 divide-y divide-border/30">
                {isLoading ? (
                  <div className="py-3 text-center text-xs text-text-muted">Memuat program studi...</div>
                ) : loadError ? (
                  <div className="py-3 text-center text-xs text-text-muted">
                    Daftar program studi belum bisa dimuat.
                  </div>
                ) : filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program, index) => {
                    const label = programLabel(program);
                    const key = program.programCode || `${program.name}-${program.degreeLevel ?? index}`;
                    const isSelected = jurusan === label || (!program.degreeLevel && jurusan === program.name);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          onSelect(label);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={cn(
                          "w-full px-2.5 py-2 rounded-md flex items-center justify-between gap-2 text-left text-xs transition-colors cursor-pointer",
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-surface-muted text-text",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{program.name}</span>
                          {program.accreditation && (
                            <span className="mt-0.5 block text-[10px] text-text-muted">
                              Akreditasi {program.accreditation}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {program.degreeLevel && (
                            <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
                              {program.degreeLevel}
                            </span>
                          )}
                          {isSelected && <Check size={14} className="text-primary" />}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-3 text-center text-xs text-text-muted">
                    {search ? "Jurusan tidak ditemukan di daftar aktif" : "Program studi tidak tersedia"}
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
