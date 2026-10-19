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
import { useSession, signOut, changePassword } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

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

export default function ProfileModule() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "transactions" | "settings"
  >("overview");

  const [stats, setStats] = useState<ProfileStats>({
    lastScore: 0,
    averageScore: 0,
    streak: 0,
    totalTryout: 0,
  });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", target: "" });

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
      window.location.reload();
    } catch {
      toast.error("Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session) return;
      setIsLoadingData(true);
      try {
        const res = await fetch(`${BACKEND_URL}/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.attempts) setAttempts(data.attempts);

          setFormData({
            name: session.user.name || "",
            target: (session.user as any).target || "",
          });
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
    setFormData({
      name: user.name,
      target: user.target === "Belum diatur" ? "" : user.target,
    });
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan profil.");

      toast.success("Profil disimpan.");
      setIsEditOpen(false);
      router.refresh();
      window.location.reload();
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
            revokeOtherSessions: true,
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
        const res = await fetch(`${BACKEND_URL}/profile/set-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: passwordForm.newPassword }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Gagal membuat password.");
        }

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
      <div className="bg-white border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-5">
          <div className="relative group shrink-0">
            <div
              className="w-20 h-20 border border-slate-200 bg-slate-50 relative cursor-pointer overflow-hidden shadow-xs"
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
                <div className="flex items-center justify-center w-full h-full text-slate-500">
                  <User size={32} />
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}

              {!isUploading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
              className="absolute -bottom-1.5 -right-1.5 bg-amber-400 p-1.5 border border-slate-300 text-slate-900 hover:bg-amber-300 transition-colors cursor-pointer z-20 shadow-xs"
              title="Ubah profil"
            >
              <Edit3 size={12} />
            </button>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-0.5 font-medium">
              PESERTA SNBT 2026
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {user.name}
            </h1>
            <p className="font-mono text-xs text-slate-500 mb-3">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <Target size={12} className="mr-1.5" />
                TARGET: {user.target}
              </Badge>
              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-amber-300 bg-amber-50 font-mono text-xs font-semibold text-amber-900 uppercase cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <PixelCoin size={12} />
                <span>COIN: {user.tokenBalance}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => router.push("/shop")}>
            Beli coin
          </Button>
          <Button variant="primary" onClick={() => router.push("/tryout")}>
            Pilih tryout
          </Button>
        </div>
      </div>

      {/* Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 divide-y divide-slate-100 shadow-xs">
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

          <div className="bg-white border border-slate-200 p-4 space-y-2 shadow-xs">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-medium">
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
                <div className="bg-white border border-slate-200 p-5 shadow-xs">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
                    SKOR TERAKHIR
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">
                    {stats.lastScore || "-"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 shadow-xs">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
                    RATA-RATA IRT
                  </div>
                  <div className="font-mono text-2xl font-bold text-blue-600">
                    {stats.averageScore || "-"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 shadow-xs">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-medium">
                    TRYOUT SELESAI
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">
                    {stats.totalTryout}
                  </div>
                </div>
              </div>

              {stats.totalTryout === 0 && (
                <div className="bg-slate-900 text-white border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Belum ada tryout yang dikerjakan
                    </h3>
                    <p className="text-sm text-slate-300 mt-0.5">
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
                    <div className="divide-y divide-blue-100">
                      {attempts.slice(0, 3).map((attempt) => (
                        <HistoryItem key={attempt.id} attempt={attempt} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-600 text-sm">
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
                  <div className="divide-y divide-blue-100">
                    {attempts.map((attempt) => (
                      <HistoryItem key={attempt.id} attempt={attempt} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-slate-500">
                      KOSONG
                    </p>
                    <p className="text-sm text-slate-700">
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
                <h3 className="font-display text-lg font-bold text-blue-900 mb-3">
                  Menunggu pembayaran
                </h3>
                <PendingTransactionList />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-blue-900 mb-3">
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
                    <Label>NAMA LENGKAP</Label>
                    <div className="p-3 border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <Label>TARGET KAMPUS &amp; PRODI</Label>
                    <div className="p-3 border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium">
                      {user.target}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>EMAIL TERDAFTAR</Label>
                  <div className="p-3 border border-slate-200 bg-slate-50 text-slate-800 text-sm flex items-center justify-between">
                    <span className="font-mono text-xs">{user.email}</span>
                    <Badge variant="success">AKTIF</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Label>KEAMANAN AKUN</Label>
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
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ubah profil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div>
              <Label htmlFor="name">NAMA LENGKAP</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama lengkap kamu"
              />
            </div>
            <div>
              <Label htmlFor="target">TARGET KAMPUS / PRODI</Label>
              <Input
                id="target"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                placeholder="Contoh: STEI ITB · Informatika"
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
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label>PASSWORD SAAT INI</Label>
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
              <Label>PASSWORD BARU</Label>
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
              <Label>ULANGI PASSWORD BARU</Label>
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "bg-slate-900 text-white font-semibold"
          : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? "text-amber-400" : "text-slate-400"}`}
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
        <h4 className="font-semibold text-blue-900 text-sm">{attempt.title}</h4>
        <p className="font-mono text-xs text-slate-600 mt-0.5">{dateStr}</p>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <div className="font-mono text-lg font-medium text-blue-900">
            {attempt.score}
          </div>
          <div className="font-mono text-[10px] uppercase text-slate-500">
            {attempt.status}
          </div>
        </div>
      </div>
    </div>
  );
}
