"use client";

import {
  LogOut,
  History,
  Settings,
  Pencil,
  Shield,
  BookOpen,
  Target,
  CreditCard,
} from "lucide-react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BACKEND_URL } from "@/lib/api";
import PendingTransactionList from "../PendingTransactionsModule/components/PendingTransactionList";
import PastTransactionList from "../PastTransactionsModule/components/PastTransactionList";
import { useRouter } from "next/navigation";
import {
  useSession,
  signOut,
  changePassword,
  setPassword,
  refreshSession,
} from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { parsePtnTargets, serializePtnTargets } from "@/lib/target";
import { UniversityLogo } from "@/components/UniversityLogo";
import { ProfileStreakWidget } from "./components/ProfileStreakWidget";
import {
  ProfileEditModal,
  ProfileSavePayload,
} from "./components/ProfileEditModal";
import { AvatarPickerModal } from "./components/AvatarPickerModal";
import {
  ProfileOverviewTab,
  AttemptItem,
  ProfileStatsData,
  HistoryRow,
} from "./components/ProfileOverviewTab";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import {
  ProfilePasswordModal,
  PasswordFormState,
} from "./components/ProfilePasswordModal";
import { getStudentAvatarUrl } from "@/lib/avatar";

let cachedProfileData: {
  stats: ProfileStatsData;
  attempts: AttemptItem[];
  phone: string;
  school: string;
  fetchedAt: number;
} | null = null;
const PROFILE_STALE_MS = 30_000;

export default function ProfileModule() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "transactions" | "settings"
  >("overview");

  const [stats, setStats] = useState<ProfileStatsData>(
    cachedProfileData?.stats ?? {
      lastScore: 0,
      averageScore: 0,
      streak: 0,
      totalTryout: 0,
    }
  );
  const [attempts, setAttempts] = useState<AttemptItem[]>(
    cachedProfileData?.attempts ?? []
  );
  const [phone, setPhone] = useState<string>(cachedProfileData?.phone ?? "");
  const [school, setSchool] = useState<string>(cachedProfileData?.school ?? "");
  const [isLoadingData, setIsLoadingData] = useState(!cachedProfileData);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const hasPassword = (session?.user as { hasPassword?: boolean })?.hasPassword ?? true;

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const handleSaveAvatar = async (avatarUrl: string) => {
    setIsAvatarSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: avatarUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal mengubah avatar.");
      }

      toast.success("Avatar berhasil diperbarui.");
      await refreshSession();
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengubah avatar.";
      toast.error(message);
    } finally {
      setIsAvatarSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session) return;
      if (
        cachedProfileData &&
        Date.now() - cachedProfileData.fetchedAt < PROFILE_STALE_MS
      ) {
        setIsLoadingData(false);
        return;
      }
      if (!cachedProfileData) setIsLoadingData(true);
      try {
        const res = await fetch(`${BACKEND_URL}/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const nextStats = data.stats ?? stats;
          const nextAttempts = data.attempts ?? attempts;
          const nextPhone = data.user?.phone ?? (session.user as { phone?: string })?.phone ?? "";
          const nextSchool = data.user?.school ?? (session.user as { school?: string })?.school ?? "";
          if (data.stats) setStats(data.stats);
          if (data.attempts) setAttempts(data.attempts);
          setPhone(nextPhone);
          setSchool(nextSchool);
          cachedProfileData = {
            stats: nextStats,
            attempts: nextAttempts,
            phone: nextPhone,
            school: nextSchool,
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

  const sessionUser = session.user as {
    name?: string;
    email?: string;
    image?: string | null;
    target?: string | null;
    phone?: string | null;
    school?: string | null;
  };

  const user = {
    name: sessionUser?.name || "Peserta Jitu",
    email: sessionUser?.email || "",
    image: sessionUser?.image || null,
    phone: phone || sessionUser?.phone || "",
    school: school || sessionUser?.school || "",
    target: sessionUser?.target || "Belum diatur",
  };
  const ptnTargets = parsePtnTargets(sessionUser?.target);

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

  const handleSaveProfile = async ({
    name: nextName,
    phone: nextPhone,
    school: nextSchool,
    targets,
  }: ProfileSavePayload) => {
    setIsSaving(true);
    try {
      const serializedTarget = serializePtnTargets(targets);

      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: nextName,
          phone: nextPhone,
          school: nextSchool,
          target: serializedTarget,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal menyimpan profil.");
      }

      setPhone(nextPhone.trim());
      setSchool(nextSchool.trim());
      if (cachedProfileData) {
        cachedProfileData = {
          ...cachedProfileData,
          phone: nextPhone.trim(),
          school: nextSchool.trim(),
        };
      }

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
          }
        );
      } else {
        await setPassword(passwordForm.newPassword);
        toast.success("Password berhasil diperbarui.");
        resetPasswordModal();
        router.refresh();
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Gagal menyimpan password.";
      toast.error(msg);
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
              className="w-20 h-20 rounded-full border-2 border-border bg-surface-muted relative cursor-pointer overflow-hidden shadow-2xs hover:border-primary transition-colors"
              onClick={() => setIsAvatarPickerOpen(true)}
              title="Klik untuk memilih avatar karakter"
            >
              <Image
                src={getStudentAvatarUrl(user.image, session.user.id)}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[#121F47]/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white">
                <Pencil className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-semibold">Ganti</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAvatarPickerOpen(true)}
              className="absolute -bottom-1 -right-1 bg-yellow-300 rounded-full p-1.5 border border-yellow-400 text-ink-900 hover:bg-yellow-400 transition-colors cursor-pointer z-20 shadow-2xs"
              title="Pilih avatar karakter"
            >
              <Pencil size={12} className="stroke-[2.2]" />
            </button>
          </div>

          <div>
            <div className="text-label text-text-muted mb-0.5">
              MASUK PTN 2027
            </div>
            <h1 className="text-[22px] font-bold text-text">{user.name}</h1>
            <p className="font-mono text-xs text-text-muted mb-3">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {ptnTargets.pilihan1 ? (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  title="Klik untuk ubah target PTN"
                  className="px-3 py-1 rounded-full text-[13.5px] font-semibold inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <UniversityLogo
                    logo={ptnTargets.pilihan1.logo}
                    acronym={ptnTargets.pilihan1.acronym}
                    size={18}
                  />
                  <span>
                    {ptnTargets.pilihan1.acronym ||
                      ptnTargets.pilihan1.university}{" "}
                    · {ptnTargets.pilihan1.jurusan}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  title="Klik untuk mengatur pilihan target PTN kamu"
                  className="px-3 py-1 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Target size={14} className="text-primary" />
                  <span>Atur target PTN</span>
                </button>
              )}
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
            <div className="text-label text-text-muted mb-1">AKSI AKUN</div>
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
            <ProfileOverviewTab
              stats={stats}
              attempts={attempts}
              isLoadingData={isLoadingData}
              ptnTargets={ptnTargets}
              onOpenEditModal={() => setIsEditOpen(true)}
              onViewAllHistory={() => setActiveTab("history")}
              onNavigateTryout={() => router.push("/tryout")}
            />
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
                      <HistoryRow key={attempt.id} attempt={attempt} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-label text-text-subtle">KOSONG</p>
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
            <ProfileSettingsTab
              user={user}
              ptnTargets={ptnTargets}
              onOpenEditModal={() => setIsEditOpen(true)}
              onOpenPasswordModal={() => setIsPasswordOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialName={user.name}
        initialPhone={user.phone}
        initialSchool={user.school}
        initialTargets={ptnTargets}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        currentImage={user.image}
        userId={session.user.id}
        onSaveAvatar={handleSaveAvatar}
        isSaving={isAvatarSaving}
      />

      {/* Change Password Modal */}
      <ProfilePasswordModal
        isOpen={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
        hasPassword={hasPassword}
        passwordForm={passwordForm}
        onChangePasswordForm={setPasswordForm}
        onSubmit={handlePasswordAction}
        isSaving={isPasswordSaving}
      />
    </div>
  );
}

function MenuButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
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
        className={`w-4 h-4 ${active ? "text-primary" : "text-text-muted"}`}
      />
      <span>{label}</span>
    </button>
  );
}
