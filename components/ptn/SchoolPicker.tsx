"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, LoaderCircle, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SchoolOption {
  npsn: string;
  name: string;
  form: "SMA" | "SMK" | "MAN";
  district: string;
  subdistrict: string;
}

interface SchoolPickerProps {
  id: string;
  value: string;
  onChange: (school: string) => void;
}

const FORM_LABELS: Record<SchoolOption["form"], string> = {
  SMA: "SMA",
  SMK: "SMK",
  MAN: "Madrasah Aliyah Negeri",
};

export function SchoolPicker({ id, value, onChange }: SchoolPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || value.trim().length < 2) {
      setSchools([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const controller = new AbortController();
    setSchools([]);
    setIsLoading(true);
    setHasError(false);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/catalog/schools?q=${encodeURIComponent(value.trim())}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Gagal memuat daftar sekolah.");
        const data = (await response.json()) as { schools: SchoolOption[] };
        setSchools(data.schools);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSchools([]);
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSchool = (school: SchoolOption) => {
    onChange(school.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, schools.length - 1));
    } else if (event.key === "ArrowUp" && schools.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      if (activeIndex >= 0 && schools[activeIndex]) selectSchool(schools[activeIndex]);
    }
  };

  return (
    <div className="relative mt-1.5" ref={containerRef}>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <Input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-options`}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${schools[activeIndex]?.npsn}` : undefined}
          autoComplete="off"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari nama sekolah atau NPSN"
          className="pl-9 pr-9"
        />
        {isLoading ? (
          <LoaderCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />
        ) : (
          <ChevronDown
            size={15}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      {isOpen && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label="Pilihan sekolah SMA, SMK, dan MAN"
          className="absolute top-full left-0 z-[60] w-full mt-1.5 rounded-lg border border-border bg-surface shadow-float overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="max-h-64 overflow-y-auto p-1">
            {value.trim().length < 2 ? (
              <p className="px-3 py-3 text-xs text-text-muted">
                Ketik minimal 2 karakter untuk mencari sekolah.
              </p>
            ) : isLoading ? (
              <p className="px-3 py-3 text-xs text-text-muted">Mencari sekolah...</p>
            ) : hasError ? (
              <p className="px-3 py-3 text-xs text-text-muted">
                Daftar sekolah belum bisa dimuat. Kamu tetap bisa memasukkan nama sekolah.
              </p>
            ) : schools.length > 0 ? (
              schools.map((school, index) => (
                <button
                  key={school.npsn}
                  id={`${id}-option-${school.npsn}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index || value === school.name}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectSchool(school)}
                  className={cn(
                    "w-full rounded-md px-2.5 py-2 text-left transition-colors flex items-center gap-2.5",
                    activeIndex === index || value === school.name
                      ? "bg-blue-50 text-blue-950"
                      : "text-text hover:bg-surface-muted",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{school.name}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">
                        {[school.district, school.subdistrict].filter(Boolean).join(" · ") || "Lokasi tidak tersedia"}
                      </span>
                      <span className="shrink-0">· {school.npsn}</span>
                    </span>
                  </span>
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-text-muted shrink-0">
                    {FORM_LABELS[school.form]}
                  </span>
                  {value === school.name && <Check size={14} className="shrink-0 text-primary" />}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-xs text-text-muted">Sekolah tidak ditemukan.</p>
            )}
          </div>
          {schools.length > 0 && (
            <div className="border-t border-border bg-surface-muted/40 px-3 py-1.5 text-[10px] text-text-muted">
              Hasil SMA, SMK, dan MAN · Pilih sekolah atau lanjutkan mengetik.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
