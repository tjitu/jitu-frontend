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
      <div className="pb-5 border-b-2 border-blue-900 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
            REKRUTMEN · JITU OPEN HIRING 2026
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
            Kelola Lamaran Open Hiring
          </h1>
          <p className="text-sm text-slate-700 mt-1">
            8 posisi terbuka di 3 divisi (Technology, Product &amp; Operations, Marketing &amp; Growth).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/careers"
            target="_blank"
            className="min-h-[40px] px-3.5 py-2 bg-white border-2 border-blue-900 font-mono text-xs uppercase tracking-[0.06em] font-semibold text-blue-900 hover:bg-blue-50 inline-flex items-center gap-2"
          >
            <span>Lihat Form Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={fetchApplications}
            className="min-h-[40px] px-3.5 py-2 bg-white border-2 border-blue-900 font-mono text-xs uppercase tracking-[0.06em] font-semibold text-blue-900 hover:bg-blue-50 inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[40px] px-4 py-2 bg-blue-600 border-2 border-blue-900 shadow-xs font-mono text-xs uppercase tracking-[0.06em] font-semibold text-white hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border-2 border-blue-900 p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
            TOTAL LAMARAN
          </div>
          <div className="font-display font-extrabold text-2xl text-blue-900 mt-1 tabular-nums">
            {applications.length}
          </div>
        </div>
        {(Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]).map((st) => (
          <div key={st} className="bg-white border-2 border-blue-900 p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500 truncate">
              {APPLICATION_STATUS_META[st].label}
            </div>
            <div className="font-display font-extrabold text-2xl text-blue-900 mt-1 tabular-nums">
              {countsByStatus[st] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-blue-900 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, ID (JITU-2026-...), email, kampus..."
            className="w-full h-10 pl-9 pr-3 border-2 border-blue-900 text-sm text-blue-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={divisionFilter}
            onChange={(e) =>
              setDivisionFilter(e.target.value as "ALL" | HiringDivision)
            }
            className="w-full h-10 px-3 border-2 border-blue-900 bg-white text-sm text-blue-900 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Divisi (3)</option>
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
            className="w-full h-10 px-3 border-2 border-blue-900 bg-white text-sm text-blue-900 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Posisi (7 role / 8 slot)</option>
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
            className="w-full h-10 px-3 border-2 border-blue-900 bg-white text-sm text-blue-900 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">Semua Status</option>
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
      <div className="bg-white border-2 border-blue-900 overflow-x-auto">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
              MEMUAT DATA LAMARAN...
            </span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <Filter className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="font-display font-bold text-base text-blue-900">
              Belum ada data lamaran yang sesuai filter
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Bagikan tautan publik{" "}
              <Link href="/careers" className="text-blue-600 underline font-mono">
                /careers
              </Link>{" "}
              atau{" "}
              <Link href="/hiring" className="text-blue-600 underline font-mono">
                /hiring
              </Link>{" "}
              kepada kandidat untuk mulai menerima pendaftaran.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-blue-900 bg-blue-50 font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900">
                <th className="py-3 px-4">ID &amp; Tanggal</th>
                <th className="py-3 px-4">Kandidat</th>
                <th className="py-3 px-4">Posisi Pilihan</th>
                <th className="py-3 px-4">Komitmen</th>
                <th className="py-3 px-4">Berkas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 text-sm">
              {filteredApplications.map((app) => {
                const statusTone =
                  app.status === "ACCEPTED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-700"
                    : app.status === "REJECTED"
                    ? "bg-red-50 text-red-800 border-red-700"
                    : app.status === "INTERVIEW"
                    ? "bg-amber-100 text-amber-900 border-amber-700"
                    : "bg-blue-50 text-blue-800 border-blue-800";

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono text-xs font-semibold text-blue-900">
                        {app.id}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-blue-900">
                        {app.fullName}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {app.university} · {app.major} ({app.academicStatus})
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                        {app.email} · {app.whatsapp}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-block px-1.5 py-0.5 border border-blue-900 bg-blue-50 font-mono text-[10px] uppercase tracking-[0.06em] text-blue-800 mb-1">
                        {app.primaryDivision}
                      </span>
                      <div className="font-semibold text-blue-900">
                        {app.primaryRole}
                      </div>
                      {app.secondaryRole && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          2nd: {app.secondaryRole}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono text-xs text-slate-700">
                      <div>{app.availability}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
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
                            className="px-2 py-1 border border-blue-900 bg-white hover:bg-blue-50 font-mono text-[11px] text-blue-800 inline-flex items-center gap-1"
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
                            className="px-2 py-1 border border-blue-900 bg-white hover:bg-blue-50 font-mono text-[11px] text-blue-800 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Portofolio</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 border font-mono text-[11px] uppercase tracking-[0.06em] font-semibold ${statusTone}`}
                      >
                        {APPLICATION_STATUS_META[app.status].label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInspector(app)}
                          className="px-2.5 py-1.5 bg-blue-600 text-white border border-blue-900 font-mono text-[11px] uppercase tracking-[0.06em] hover:bg-blue-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app.id)}
                          aria-label={`Hapus ${app.id}`}
                          className="p-1.5 bg-white text-red-700 border border-blue-900 hover:bg-red-50 cursor-pointer"
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
          className="fixed inset-0 z-50 bg-blue-950/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border-2 border-blue-900 shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-blue-900 bg-blue-50 flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.08em] text-blue-700">
                  {selectedApp.id} · DIKIRIM{" "}
                  {new Date(selectedApp.createdAt).toLocaleString("id-ID")}
                </div>
                <h2
                  id="applicant-modal-title"
                  className="font-display font-bold text-xl text-blue-900 mt-1"
                >
                  {selectedApp.fullName}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedApp.university} · {selectedApp.major} ({selectedApp.academicStatus}) ·{" "}
                  {selectedApp.domicile}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-9 h-9 border-2 border-blue-900 bg-white text-blue-900 hover:bg-blue-100 inline-flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-sm">
              {/* Contact & Role Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-blue-900 p-4 space-y-2">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    KONTAK &amp; IDENTITAS
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="underline break-all"
                    >
                      {selectedApp.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{selectedApp.whatsapp}</span>
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    Status akademik: <strong>{selectedApp.academicStatus}</strong>
                  </div>
                </div>

                <div className="border-2 border-blue-900 p-4 space-y-2">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
                    POSISI &amp; KOMITMEN
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-blue-900">
                    <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      1st: {selectedApp.primaryRole} ({selectedApp.primaryDivision})
                    </span>
                  </div>
                  {selectedApp.secondaryRole && (
                    <div className="text-xs text-slate-700">
                      2nd: {selectedApp.secondaryRole}
                    </div>
                  )}
                  <div className="font-mono text-xs text-slate-700 pt-1">
                    Alokasi: <strong>{selectedApp.availability}</strong> · Mulai:{" "}
                    <strong>{selectedApp.startDate}</strong>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="border-2 border-blue-900 p-4 space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  DOKUMEN &amp; PROOF OF WORK
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {selectedApp.cvUrl && (
                    <a
                      href={selectedApp.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 border-2 border-blue-900 bg-blue-50 hover:bg-blue-100 font-mono text-xs font-semibold text-blue-900 inline-flex items-center gap-1.5"
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
                      className="px-3 py-1.5 border-2 border-blue-900 bg-white hover:bg-blue-50 font-mono text-xs font-semibold text-blue-900 inline-flex items-center gap-1.5"
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
                      className="px-3 py-1.5 border-2 border-blue-900 bg-white hover:bg-blue-50 font-mono text-xs font-semibold text-blue-900 inline-flex items-center gap-1.5"
                    >
                      <span>LinkedIn / GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Essays */}
              <div className="space-y-4">
                <div className="border-2 border-blue-900 p-4 bg-slate-50">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-blue-700 mb-1.5">
                    1. TRACK RECORD ORGANISASI / PROYEK NYATA
                  </div>
                  <p className="whitespace-pre-line text-slate-800 leading-relaxed">
                    {selectedApp.experienceEssay}
                  </p>
                </div>

                <div className="border-2 border-blue-900 p-4 bg-slate-50">
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-blue-700 mb-1.5">
                    2. ALASAN MEMILIH JITU &amp; RENCANA VALUE CREATION
                  </div>
                  <p className="whitespace-pre-line text-slate-800 leading-relaxed">
                    {selectedApp.motivationEssay}
                  </p>
                </div>
              </div>

              {/* Admin Status Update & Notes */}
              <div className="border-2 border-blue-900 p-4 bg-blue-50/60 space-y-4">
                <div className="font-mono text-xs uppercase tracking-[0.08em] font-semibold text-blue-900">
                  KEPUTUSAN TIM REKRUTMEN
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900 mb-1">
                      Status Aplikasi
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) =>
                        setStatusDraft(e.target.value as ApplicationStatus)
                      }
                      className="w-full h-10 px-3 border-2 border-blue-900 bg-white text-sm font-semibold text-blue-900"
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
                    <div className="text-xs text-slate-600">
                      Perubahan status langsung terlihat saat kandidat mengecek status di{" "}
                      <span className="font-mono text-blue-800">/careers#status</span>.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-blue-900 mb-1">
                    Catatan Internal Reviewer (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Tambahkan catatan hasil screening CV, jadwal interview, atau poin negosiasi profit-sharing..."
                    className="w-full p-3 border-2 border-blue-900 bg-white text-sm text-blue-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-blue-900 bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="min-h-[40px] px-4 py-2 border-2 border-blue-900 bg-white font-mono text-xs uppercase tracking-[0.06em] font-semibold text-blue-900 hover:bg-blue-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEvaluation}
                className="min-h-[40px] px-5 py-2 border-2 border-blue-900 bg-blue-600 shadow-xs font-mono text-xs uppercase tracking-[0.06em] font-semibold text-white hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Simpan Status &amp; Catatan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

