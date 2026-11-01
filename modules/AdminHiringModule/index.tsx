"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  APPLICATION_STATUS_META,
  HIRING_DIVISIONS,
  HIRING_POSITIONS,
  type ApplicationStatus,
  type HiringApplication,
  type HiringDivision,
} from "@/lib/hiring-types";

export default function AdminHiringModule() {
  const [applications, setApplications] = useState<HiringApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<"ALL" | HiringDivision>("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApplicationStatus>("ALL");

  const [selectedApp, setSelectedApp] = useState<HiringApplication | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<ApplicationStatus>("SUBMITTED");
  const [isSaving, setIsSaving] = useState(false);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/hiring?admin=true", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal memuat data pelamar.");
      }
      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat daftar pelamar JITU Open Hiring 2026.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (divisionFilter !== "ALL" && app.primaryDivision !== divisionFilter) {
        return false;
      }
      if (positionFilter !== "ALL" && app.primaryRole !== positionFilter) {
        return false;
      }
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystack = [
          app.id,
          app.fullName,
          app.email,
          app.whatsapp,
          app.university,
          app.major,
          app.primaryRole,
          app.secondaryRole || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [applications, divisionFilter, positionFilter, statusFilter, searchQuery]);

  const countsByStatus = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    };
    for (const app of applications) {
      counts[app.status] = (counts[app.status] || 0) + 1;
    }
    return counts;
  }, [applications]);

  const openInspector = (app: HiringApplication) => {
    setSelectedApp(app);
    setStatusDraft(app.status);
    setNotesDraft(app.adminNotes || "");
  };

  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/hiring/${encodeURIComponent(selectedApp.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusDraft,
          adminNotes: notesDraft,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Gagal memperbarui status aplikasi.");
      }

      const updated: HiringApplication = data.application;
      setApplications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelectedApp(updated);
      toast.success(`Status ${updated.id} diperbarui ke ${statusDraft}.`);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Gagal menyimpan perubahan.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm(`Hapus permanen lamaran ${id}?`)) return;
    try {
      const res = await fetch(`/api/hiring/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Gagal menghapus lamaran.");
      }
      setApplications((prev) => prev.filter((item) => item.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
      toast.success(`Lamaran ${id} berhasil dihapus.`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus lamaran.");
    }
  };

  const handleExportCsv = () => {
    if (filteredApplications.length === 0) {
      toast.error("Tidak ada data pelamar untuk diekspor.");
      return;
    }

    const headers = [
      "ID",
      "Status",
      "SubmittedAt",
      "FullName",
      "Email",
      "WhatsApp",
      "Domicile",
      "AcademicStatus",
      "University",
      "Major",
      "PrimaryDivision",
      "PrimaryRole",
      "SecondaryRole",
      "Availability",
      "StartDate",
      "CvUrl",
      "PortfolioUrl",
      "LinkedinUrl",
      "ExperienceEssay",
      "MotivationEssay",
      "ReferralSource",
      "AdminNotes",
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredApplications.map((app) =>
      [
        app.id,
        app.status,
        app.createdAt,
        app.fullName,
        app.email,
        app.whatsapp,
        app.domicile,
        app.academicStatus,
        app.university,
        app.major,
        app.primaryDivision,
        app.primaryRole,
        app.secondaryRole || "",
        app.availability,
        app.startDate,
        app.cvUrl,
        app.portfolioUrl || "",
        app.linkedinUrl || "",
        app.experienceEssay,
        app.motivationEssay,
        app.referralSource || "",
        app.adminNotes || "",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JITU-Open-Hiring-2026-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data pelamar diekspor ke CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-5 border-b border-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-label text-primary mb-1">
            REKRUTMEN · JITU OPEN HIRING 2026
          </p>
          <h1 className="text-h2 font-bold text-text">
            Kelola lamaran Open Hiring
          </h1>
          <p className="text-[14px] text-text-muted mt-1">
            8 posisi terbuka di 3 divisi (Technology, Product &amp; Operations, Marketing &amp; Growth).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/careers"
            target="_blank"
            className="h-9 px-3.5 rounded-md bg-surface border border-border text-[13px] font-semibold text-text hover:bg-surface-muted inline-flex items-center gap-2 transition-colors"
          >
            <span>Lihat form publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={fetchApplications}
            className="h-9 px-3.5 rounded-md bg-surface border border-border text-[13px] font-semibold text-text hover:bg-surface-muted inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-4 rounded-md bg-primary hover:bg-primary-hover text-[13px] font-semibold text-white inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-surface rounded-lg border border-border p-4">
          <div className="text-label text-text-muted">
            TOTAL LAMARAN
          </div>
          <div className="font-mono font-bold text-2xl text-text mt-1 tabular-nums">
            {applications.length}
          </div>
        </div>
        {(Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]).map((st) => (
          <div key={st} className="bg-surface rounded-lg border border-border p-4">
            <div className="text-label text-text-muted truncate">
              {APPLICATION_STATUS_META[st].label}
            </div>
            <div className="font-mono font-bold text-2xl text-text mt-1 tabular-nums">
              {countsByStatus[st] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-lg border border-border p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, ID (JITU-2026-...), email, kampus..."
            className="w-full h-11 pl-10 pr-3.5 rounded-md border border-border bg-surface text-sm text-text placeholder:text-text-subtle hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={divisionFilter}
            onChange={(e) =>
              setDivisionFilter(e.target.value as "ALL" | HiringDivision)
            }
            className="w-full h-11 px-3.5 rounded-md border border-border bg-surface text-sm text-text hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
          >
            <option value="ALL">Semua divisi (3)</option>
            {HIRING_DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="w-full h-11 px-3.5 rounded-md border border-border bg-surface text-sm text-text hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
          >
            <option value="ALL">Semua posisi (7 role / 8 slot)</option>
            {HIRING_POSITIONS.map((pos) => (
              <option key={pos.id} value={pos.title}>
                {pos.title} ({pos.slots})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | ApplicationStatus)
            }
            className="w-full h-11 px-3.5 rounded-md border border-border bg-surface text-sm text-text hover:border-ink-300 focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200 transition-colors"
          >
            <option value="ALL">Semua status</option>
            {(Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]).map(
              (st) => (
                <option key={st} value={st}>
                  {APPLICATION_STATUS_META[st].label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-surface rounded-lg border border-border overflow-x-auto">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-[13px] font-medium text-text-muted">
              Memuat data lamaran...
            </span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <Filter className="w-6 h-6 text-text-subtle mx-auto" />
            <div className="font-bold text-base text-text">
              Belum ada data lamaran yang sesuai filter
            </div>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Bagikan tautan publik{" "}
              <Link href="/careers" className="text-primary underline font-mono">
                /careers
              </Link>{" "}
              atau{" "}
              <Link href="/hiring" className="text-primary underline font-mono">
                /hiring
              </Link>{" "}
              kepada kandidat untuk mulai menerima pendaftaran.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-ink-50 text-[12px] uppercase tracking-[0.06em] font-semibold text-ink-500">
                <th className="py-3 px-4">ID &amp; Tanggal</th>
                <th className="py-3 px-4">Kandidat</th>
                <th className="py-3 px-4">Posisi Pilihan</th>
                <th className="py-3 px-4">Komitmen</th>
                <th className="py-3 px-4">Berkas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm">
              {filteredApplications.map((app) => {
                const statusTone =
                  app.status === "ACCEPTED"
                    ? "bg-success-soft text-success-text"
                    : app.status === "REJECTED"
                    ? "bg-danger-soft text-danger-text"
                    : app.status === "INTERVIEW"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-50 text-blue-800";

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-surface-muted transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono text-xs font-semibold text-text">
                        {app.id}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-text">
                        {app.fullName}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {app.university} · {app.major} ({app.academicStatus})
                      </div>
                      <div className="font-mono text-[11px] text-text-muted mt-0.5">
                        {app.email} · {app.whatsapp}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-flex h-5 items-center px-2 rounded-full bg-surface-muted border border-border text-[11px] font-semibold text-text-muted mb-1">
                        {app.primaryDivision}
                      </span>
                      <div className="font-semibold text-text">
                        {app.primaryRole}
                      </div>
                      {app.secondaryRole && (
                        <div className="text-xs text-text-muted mt-0.5">
                          2nd: {app.secondaryRole}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono text-xs text-text-body">
                      <div>{app.availability}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Mulai: {app.startDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-2.5 rounded-sm border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text inline-flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>CV</span>
                          </a>
                        )}
                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 px-2.5 rounded-sm border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text inline-flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Portofolio</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-flex h-6 items-center px-2.5 rounded-full text-[12px] font-semibold ${statusTone}`}
                      >
                        {APPLICATION_STATUS_META[app.status].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInspector(app)}
                          className="h-8 px-3 rounded-sm bg-primary text-white text-xs font-semibold hover:bg-primary-hover inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app.id)}
                          aria-label={`Hapus ${app.id}`}
                          className="h-8 w-8 rounded-sm bg-surface text-danger border border-border hover:bg-danger-soft inline-flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Detail & Evaluation Modal */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="applicant-modal-title"
          className="fixed inset-0 z-50 bg-[#121F47]/50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-surface rounded-xl border border-border shadow-modal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border bg-surface-muted flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-primary">
                  {selectedApp.id} · Dikirim{" "}
                  {new Date(selectedApp.createdAt).toLocaleString("id-ID")}
                </div>
                <h2
                  id="applicant-modal-title"
                  className="font-bold text-xl text-text mt-1"
                >
                  {selectedApp.fullName}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {selectedApp.university} · {selectedApp.major} ({selectedApp.academicStatus}) ·{" "}
                  {selectedApp.domicile}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-9 h-9 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-muted inline-flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-sm">
              {/* Contact & Role Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <div className="text-label text-text-muted">
                    KONTAK &amp; IDENTITAS
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="underline break-all"
                    >
                      {selectedApp.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-text">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span>{selectedApp.whatsapp}</span>
                  </div>
                  <div className="text-xs text-text-muted pt-1">
                    Status akademik: <strong>{selectedApp.academicStatus}</strong>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-2">
                  <div className="text-label text-text-muted">
                    POSISI &amp; KOMITMEN
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-text">
                    <Briefcase className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      1st: {selectedApp.primaryRole} ({selectedApp.primaryDivision})
                    </span>
                  </div>
                  {selectedApp.secondaryRole && (
                    <div className="text-xs text-text-body">
                      2nd: {selectedApp.secondaryRole}
                    </div>
                  )}
                  <div className="font-mono text-xs text-text-body pt-1">
                    Alokasi: <strong>{selectedApp.availability}</strong> · Mulai:{" "}
                    <strong>{selectedApp.startDate}</strong>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="text-label text-text-muted">
                  DOKUMEN &amp; PROOF OF WORK
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {selectedApp.cvUrl && (
                    <a
                      href={selectedApp.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-3 rounded-md border border-border bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buka CV ({selectedApp.cvFileName || "Tautan CV"})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-3 rounded-md border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Portofolio / Karya</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedApp.linkedinUrl && (
                    <a
                      href={selectedApp.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-3 rounded-md border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>LinkedIn / GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Essays */}
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-surface-muted">
                  <div className="text-label text-primary mb-1.5">
                    1. TRACK RECORD ORGANISASI / PROYEK NYATA
                  </div>
                  <p className="whitespace-pre-line text-text-body leading-relaxed">
                    {selectedApp.experienceEssay}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4 bg-surface-muted">
                  <div className="text-label text-primary mb-1.5">
                    2. ALASAN MEMILIH JITU &amp; RENCANA VALUE CREATION
                  </div>
                  <p className="whitespace-pre-line text-text-body leading-relaxed">
                    {selectedApp.motivationEssay}
                  </p>
                </div>
              </div>

              {/* Admin Status Update & Notes */}
              <div className="rounded-lg border border-blue-200 p-4 bg-blue-50/60 space-y-4">
                <div className="text-label text-blue-800">
                  KEPUTUSAN TIM REKRUTMEN
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text mb-1.5">
                      Status aplikasi
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) =>
                        setStatusDraft(e.target.value as ApplicationStatus)
                      }
                      className="w-full h-11 px-3.5 rounded-md border border-border bg-surface text-sm font-semibold text-text"
                    >
                      {(
                        Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]
                      ).map((st) => (
                        <option key={st} value={st}>
                          {APPLICATION_STATUS_META[st].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="text-xs text-text-muted">
                      Perubahan status langsung terlihat saat kandidat mengecek status di{" "}
                      <span className="font-mono text-primary">/careers#status</span>.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text mb-1.5">
                    Catatan internal reviewer (opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Tambahkan catatan hasil screening CV, jadwal interview, atau poin negosiasi profit-sharing..."
                    className="w-full p-3.5 rounded-md border border-border bg-surface text-sm text-text focus:outline-none focus:border-primary focus:ring-3 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="h-10 px-4 rounded-md border border-border bg-surface text-sm font-semibold text-text hover:bg-surface-muted cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEvaluation}
                className="h-10 px-5 rounded-md bg-primary text-sm font-semibold text-white hover:bg-primary-hover inline-flex items-center gap-2 cursor-pointer disabled:opacity-45 transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Simpan status &amp; catatan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

