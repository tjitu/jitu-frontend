"use client";

import {
  User,
  LogOut,
  History,
  Settings,
  Edit3,
  Shield,
  BookOpen,
  Target,
  Lock,
  KeyRound,
  CreditCard,
  Camera,
  Loader2,
} from "lucide-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PixelCoin } from "@/components/ui/pixel-coin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { BACKEND_URL } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PendingTransactionList from "../PendingTransactionsModule/components/PendingTransactionList";
import PastTransactionList from "../PastTransactionsModule/components/PastTransactionList";
import { useRouter } from "next/navigation";
import { useSession, signOut, changePassword, setPassword, refreshSession } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PtnTargets, parsePtnTargets, serializePtnTargets } from "@/lib/target";
import { UniversityLogo } from "@/components/UniversityLogo";
import { ProfileStreakWidget } from "./components/ProfileStreakWidget";
import { ProfileEditModal } from "./components/ProfileEditModal";

interface Attempt {
  id: string;
  title: string;
  date: string;
  score: number;
  status: string;
}

interface ProfileStats {
  totalTryout: number;
  averageScore: number;
  lastScore: number;
  streak: number;
}

let cachedProfileData: { stats: ProfileStats; attempts: Attempt[]; fetchedAt: number } | null = null;
const PROFILE_STALE_MS = 30_000;

export default function ProfileModule() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "transactions" | "settings"
  >("overview");

  const [stats, setStats] = useState<ProfileStats>(
    cachedProfileData?.stats ?? {
      lastScore: 0,
      averageScore: 0,
      streak: 0,
      totalTryout: 0,
    }
  );
  const [attempts, setAttempts] = useState<Attempt[]>(
    cachedProfileData?.attempts ?? []
  );
  const [isLoadingData, setIsLoadingData] = useState(!cachedProfileData);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const hasPassword = (session?.user as any)?.hasPassword ?? false;

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/profile`, {
        method: "PUT",
        body: uploadData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Gagal mengunggah foto.");

      toast.success("Foto profil diperbarui.");
      await refreshSession();
    } catch {
      toast.error("Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session) return;
      if (cachedProfileData && Date.now() - cachedProfileData.fetchedAt < PROFILE_STALE_MS) {
        setIsLoadingData(false);
        return;
      }
      if (!cachedProfileData) setIsLoadingData(true);
      try {
        const res = await fetch(`${BACKEND_URL}/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          const nextStats = data.stats ?? stats;
          const nextAttempts = data.attempts ?? attempts;
          if (data.stats) setStats(data.stats);
          if (data.attempts) setAttempts(data.attempts);
          cachedProfileData = {
            stats: nextStats,
            attempts: nextAttempts,
            fetchedAt: Date.now(),
          };
        }
      } catch (error) {
        console.error("Gagal memuat data profil:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfileData();
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
        MEMUAT PROFIL...
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const user = {
    name: session.user?.name || "Peserta Jitu",
    email: session.user?.email || "",
    image: session.user?.image || null,
    target: (session.user as any).target || "Belum diatur",
    tokenBalance: (session.user as any).tokenBalance || 0,
  };
  const ptnTargets = parsePtnTargets((session.user as any)?.target);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Kamu sudah keluar dari akun.");
          router.replace("/login");
        },
      },
    });
  };

  const openEditModal = () => {
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (name: string, targets: PtnTargets) => {
    setIsSaving(true);
    try {
      const serializedTarget = serializePtnTargets(targets);

      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          target: serializedTarget,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan profil.");

      toast.success("Profil berhasil diperbarui.");
      setIsEditOpen(false);
      await refreshSession();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetPasswordModal = () => {
    setIsPasswordOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordAction = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Password baru wajib diisi.");
      return;
    }
    if (hasPassword && !passwordForm.currentPassword) {
      toast.error("Password saat ini wajib diisi.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    setIsPasswordSaving(true);
    try {
      if (hasPassword) {
        await changePassword(
          {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
          {
            onSuccess: () => {
              toast.success("Password berhasil diubah.");
              resetPasswordModal();
            },
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
          },
        );
      } else {
        await setPassword(passwordForm.newPassword);

        toast.success("Password berhasil dibuat.");
        resetPasswordModal();
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan password.");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Profile Sheet Header */}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div className="relative group shrink-0">
            <div
              className="w-20 h-20 rounded-lg border border-border bg-surface-muted relative cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-text-muted">
                  <User size={32} />
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-[#121F47]/60 flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}

              {!isUploading && (
                <div className="absolute inset-0 bg-[#121F47]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={openEditModal}
              className="absolute -bottom-1.5 -right-1.5 bg-yellow-300 rounded-full p-1.5 border border-yellow-400 text-ink-900 hover:bg-yellow-400 transition-colors cursor-pointer z-20"
              title="Ubah profil"
            >
              <Edit3 size={12} />
            </button>
          </div>

          <div>
            <div className="text-label text-text-muted mb-0.5">
              PESERTA SNBT 2026
            </div>
            <h1 className="text-[22px] font-bold text-text">
              {user.name}
            </h1>
            <p className="font-mono text-xs text-text-muted mb-3">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ptnTargets.pilihan1 ? (
                <>
                  <button
                    type="button"
                    onClick={openEditModal}
                    title="Klik untuk ubah target PTN"
                    className="h-6 px-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <UniversityLogo
                      logo={ptnTargets.pilihan1.logo}
                      acronym={ptnTargets.pilihan1.acronym}
                      size={14}
                    />
                    <span>Pil 1: {ptnTargets.pilihan1.acronym || ptnTargets.pilihan1.university} · {ptnTargets.pilihan1.jurusan}</span>
                  </button>
                  {ptnTargets.pilihan2 && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      title="Klik untuk ubah target PTN"
                      className="h-6 px-2.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-surface text-text-body border border-border hover:bg-surface-muted transition-colors cursor-pointer"
                    >
                      <UniversityLogo
                        logo={ptnTargets.pilihan2.logo}
                        acronym={ptnTargets.pilihan2.acronym}
                        size={14}
                      />
                      <span>Pil 2: {ptnTargets.pilihan2.acronym || ptnTargets.pilihan2.university} · {ptnTargets.pilihan2.jurusan}</span>
                    </button>
                  )}
                  {ptnTargets.pilihan3 && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      title="Klik untuk ubah target PTN"
                      className="h-6 px-2.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-surface text-text-body border border-border hover:bg-surface-muted transition-colors cursor-pointer"
                    >
                      <UniversityLogo
                        logo={ptnTargets.pilihan3.logo}
                        acronym={ptnTargets.pilihan3.acronym}
                        size={14}
                      />
                      <span>Pil 3: {ptnTargets.pilihan3.acronym || ptnTargets.pilihan3.university} · {ptnTargets.pilihan3.jurusan}</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={openEditModal}
                  title="Klik untuk mengatur 3 pilihan target PTN kamu"
                  className="h-6 px-2.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 bg-surface text-text-body border border-dashed border-primary/60 hover:border-primary hover:bg-blue-50 hover:text-primary transition-colors cursor-pointer group"
                >
                  <Target size={12} className="text-primary group-hover:scale-110 transition-transform" />
                  <span>Target PTN belum diatur (Atur sekarang)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="h-6 inline-flex items-center gap-1.5 px-2.5 rounded-full bg-yellow-100 text-[12px] font-semibold text-yellow-700 cursor-pointer hover:bg-yellow-200 transition-colors"
              >
                <PixelCoin size={12} />
                <span>{user.tokenBalance} coin</span>
              </button>
            </div>
          </div>
        </div>

        <ProfileStreakWidget streak={stats.streak} />
      </div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface border border-border rounded-lg p-1.5 space-y-1">
            <MenuButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={BookOpen}
              label="Ringkasan"
            />
            <MenuButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={History}
              label="Riwayat tryout"
            />
            <MenuButton
              active={activeTab === "transactions"}
              onClick={() => setActiveTab("transactions")}
              icon={CreditCard}
              label="Transaksi coin"
            />
            <MenuButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={Settings}
              label="Pengaturan akun"
            />
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <div className="text-label text-text-muted mb-1">
              AKSI AKUN
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() =>
                window.open("https://wa.me/628123456789", "_blank")
              }
            >
              <Shield className="mr-2 h-4 w-4" />
              Hubungi bantuan
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar akun
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-lg p-5">
                  <div className="text-label text-text-muted mb-1">
                    SKOR TERAKHIR
                  </div>
                  <div className="font-mono text-2xl font-bold text-text tabular-nums">
                    {stats.lastScore || "-"}
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <div className="text-label text-text-muted mb-1">
                    RATA-RATA IRT
                  </div>
                  <div className="font-mono text-2xl font-bold text-primary tabular-nums">
                    {stats.averageScore || "-"}
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <div className="text-label text-text-muted mb-1">
                    TRYOUT SELESAI
                  </div>
                  <div className="font-mono text-2xl font-bold text-text tabular-nums">
                    {stats.totalTryout}
                  </div>
                </div>
              </div>

              {/* Target PTN Card on Overview */}
              <div className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-text">Target PTN Impian (3 Pilihan SNBT)</h4>
                  </div>
                  <div className="text-xs text-text-body">
                    {ptnTargets.pilihan1 ? (
                      <div className="flex flex-wrap items-center gap-3 pt-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-primary">
                          <UniversityLogo
                            logo={ptnTargets.pilihan1.logo}
                            acronym={ptnTargets.pilihan1.acronym}
                            size={16}
                          />
                          <span>
                            Pil 1: {ptnTargets.pilihan1.acronym || ptnTargets.pilihan1.university} - {ptnTargets.pilihan1.jurusan}
                          </span>
                        </div>
                        {ptnTargets.pilihan2 && (
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <span>·</span>
                            <UniversityLogo
                              logo={ptnTargets.pilihan2.logo}
                              acronym={ptnTargets.pilihan2.acronym}
                              size={16}
                            />
                            <span>
                              Pil 2: {ptnTargets.pilihan2.acronym || ptnTargets.pilihan2.university} - {ptnTargets.pilihan2.jurusan}
                            </span>
                          </div>
                        )}
                        {ptnTargets.pilihan3 && (
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <span>·</span>
                            <UniversityLogo
                              logo={ptnTargets.pilihan3.logo}
                              acronym={ptnTargets.pilihan3.acronym}
                              size={16}
                            />
                            <span>
                              Pil 3: {ptnTargets.pilihan3.acronym || ptnTargets.pilihan3.university} - {ptnTargets.pilihan3.jurusan}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted italic">
                        Belum ada target PTN yang diatur. Tentukan 3 kampus &amp; prodi impianmu untuk melihat peluang kelulusan.
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={openEditModal} className="shrink-0 text-xs gap-1.5 self-start sm:self-center">
                  <Edit3 size={13} />
                  {ptnTargets.pilihan1 ? "Ubah Target PTN" : "Atur Target PTN"}
                </Button>
              </div>

              {stats.totalTryout === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[18px] font-bold text-text">
                      Belum ada tryout yang dikerjakan
                    </h3>
                    <p className="text-[14px] text-text-body mt-0.5">
                      Coba 1 paket tryout gratis untuk lihat baseline skor IRT
                      kamu.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/tryout")}
                  >
                    Coba tryout gratis
                  </Button>
                </div>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tryout terakhir</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("history")}
                  >
                    Lihat semua
                  </Button>
                </CardHeader>
                <CardContent>
                  {attempts.length > 0 ? (
                    <div className="divide-y divide-border">
                      {attempts.slice(0, 3).map((attempt) => (
                        <HistoryItem key={attempt.id} attempt={attempt} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-muted text-sm">
                      {isLoadingData
                        ? "Memuat data..."
                        : "Belum ada tryout yang selesai."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Riwayat pengerjaan</CardTitle>
              </CardHeader>
              <CardContent>
                {attempts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {attempts.map((attempt) => (
                      <HistoryItem key={attempt.id} attempt={attempt} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-label text-text-subtle">
                      KOSONG
                    </p>
                    <p className="text-sm text-text-muted">
                      Belum ada tryout yang selesai.
                    </p>
                    <Button
                      variant="default"
                      onClick={() => router.push("/tryout")}
                    >
                      Pilih tryout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[18px] font-bold text-text mb-3">
                  Menunggu pembayaran
                </h3>
                <PendingTransactionList />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-text mb-3">
                  Riwayat pembelian
                </h3>
                <PastTransactionList />
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pengaturan akun</CardTitle>
                <Button variant="outline" size="sm" onClick={openEditModal}>
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Ubah profil
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Nama lengkap</Label>
                    <div className="p-3 rounded-md border border-border bg-surface-muted text-text text-sm font-medium">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <Label>Email terdaftar</Label>
                    <div className="p-3 rounded-md border border-border bg-surface-muted text-text text-sm flex items-center justify-between">
                      <span className="font-mono text-xs">{user.email}</span>
                      <Badge variant="success">Aktif</Badge>
                    </div>
                  </div>
                </div>

                {/* Target PTN & Program Studi (Pilihan 1, 2, 3) */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-text flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Target PTN &amp; Program Studi
                      </Label>
                      <p className="text-xs text-text-muted mt-0.5">
                        3 Pilihan kampus dan jurusan impianmu untuk persiapan SNBT
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={openEditModal} className="text-xs text-primary">
                      Ubah Target
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                        Pilihan 1 (Utama)
                      </div>
                      {ptnTargets.pilihan1 ? (
                        <div className="flex items-center gap-2">
                          <UniversityLogo
                            logo={ptnTargets.pilihan1.logo}
                            acronym={ptnTargets.pilihan1.acronym}
                            size={20}
                          />
                          <div className="text-xs font-semibold text-text leading-tight">
                            <div>{ptnTargets.pilihan1.acronym || ptnTargets.pilihan1.university}</div>
                            <div className="text-text-muted font-normal text-[11px]">{ptnTargets.pilihan1.jurusan}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-text-muted italic text-xs">Belum diatur</div>
                      )}
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-bold">
                        Pilihan 2 (Opsional)
                      </div>
                      {ptnTargets.pilihan2 ? (
                        <div className="flex items-center gap-2">
                          <UniversityLogo
                            logo={ptnTargets.pilihan2.logo}
                            acronym={ptnTargets.pilihan2.acronym}
                            size={20}
                          />
                          <div className="text-xs font-semibold text-text leading-tight">
                            <div>{ptnTargets.pilihan2.acronym || ptnTargets.pilihan2.university}</div>
                            <div className="text-text-muted font-normal text-[11px]">{ptnTargets.pilihan2.jurusan}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-text-muted italic text-xs">Belum diatur</div>
                      )}
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-bold">
                        Pilihan 3 (Opsional)
                      </div>
                      {ptnTargets.pilihan3 ? (
                        <div className="flex items-center gap-2">
                          <UniversityLogo
                            logo={ptnTargets.pilihan3.logo}
                            acronym={ptnTargets.pilihan3.acronym}
                            size={20}
                          />
                          <div className="text-xs font-semibold text-text leading-tight">
                            <div>{ptnTargets.pilihan3.acronym || ptnTargets.pilihan3.university}</div>
                            <div className="text-text-muted font-normal text-[11px]">{ptnTargets.pilihan3.jurusan}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-text-muted italic text-xs">Belum diatur</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Label>Keamanan akun</Label>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordOpen(true)}
                  >
                    {hasPassword ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : (
                      <KeyRound className="w-4 h-4 mr-2" />
                    )}
                    {hasPassword ? "Ubah password" : "Buat password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialName={user.name}
        initialTargets={ptnTargets}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />

      {/* Change Password Modal */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {hasPassword ? "Ubah password" : "Buat password baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            {hasPassword && (
              <div>
                <Label>Password saat ini</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div>
              <Label>Password baru</Label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Ulangi password baru</Label>
              <Input
                type="password"
                placeholder="Ketik ulang password baru"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={handlePasswordAction}
              disabled={isPasswordSaving}
            >
              {isPasswordSaving ? "Menyimpan..." : "Simpan password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[14px] font-medium transition-colors cursor-pointer ${
        active
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "bg-surface text-text-body hover:bg-surface-muted hover:text-text"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? "text-primary" : "text-text-muted"}`}
      />
      <span>{label}</span>
    </button>
  );
}

function HistoryItem({ attempt }: { attempt: Attempt }) {
  const dateStr = new Date(attempt.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
      <div>
        <h4 className="font-semibold text-text text-sm">{attempt.title}</h4>
        <p className="font-mono text-xs text-text-muted mt-0.5">{dateStr}</p>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <div className="font-mono text-lg font-bold text-text tabular-nums">
            {attempt.score}
          </div>
          <div className="font-mono text-[10px] uppercase text-text-muted">
            {attempt.status}
          </div>
        </div>
      </div>
    </div>
  );
}
