"use client";
import {
  Calendar,
  Users,
  Coins,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Camera,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Line } from "react-chartjs-2"; // Import Line Chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { subtests } from "./payload";
import { ScoreData } from "./interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserWithRole } from "@/lib/types";
import { useSession } from "@/lib/auth-client";
import {
  getUserStats,
  getOngoingTryouts,
  getAvailableTryouts,
  getScoreHistory,
  UserStats,
  OngoingTryout,
  AvailableTryout,
  ScoreHistory,
} from "@/lib/api/DashboardApi";
import { toast } from "sonner";
import { RegisterModal } from "./components/RegisterModal";
import { BACKEND_URL } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  action,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  action?: React.ReactNode;
}) => (
  <Card className="border-0 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] ring-1 ring-gray-100/70 transition-all duration-300 hover:shadow-[0_18px_42px_-24px_rgba(15,23,42,0.45)]">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {action && <div className="absolute bottom-4 right-4">{action}</div>}
    </CardContent>
  </Card>
);

const DashboardModule = () => {
  const router = useRouter();
  const [activeSubtests, setActiveSubtests] = useState<string[]>(["total"]);
  const { data: session, isPending } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [ongoingTryouts, setOngoingTryouts] = useState<OngoingTryout[]>([]);
  const [availableTryoutsData, setAvailableTryoutsData] = useState<
    AvailableTryout[]
  >([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedTryout, setSelectedTryout] = useState<OngoingTryout | null>(
    null,
  );
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Profile Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
      } else if ((session.user as unknown as UserWithRole).role === "ADMIN") {
        router.push("/admin");
      } else {
        loadDashboardData();
      }
    }
  }, [session, isPending, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [stats, ongoing, available, history] = await Promise.all([
        getUserStats(),
        getOngoingTryouts(),
        getAvailableTryouts(),
        getScoreHistory(),
      ]);

      setUserStats(stats);
      setOngoingTryouts(ongoing);
      setAvailableTryoutsData(available);
      setScoreHistory(history);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (tryout: OngoingTryout) => {
    setSelectedTryout(tryout);
    setRegisterError("");
    setRegisterModalOpen(true);
  };

  const onConfirmRegister = async () => {
    if (!selectedTryout) return;
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const res = await fetch(
        `${BACKEND_URL}/tryout/${selectedTryout.id}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar tryout");
      }

      toast.success(data.message);
      setRegisterModalOpen(false);

      // Refresh data
      loadDashboardData();
    } catch (err) {
      setRegisterError(
        err instanceof Error ? err.message : "Gagal mendaftar tryout",
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/profile`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Gagal mengupload foto");

      toast.success("Foto profil berhasil diperbarui!");
      window.location.reload(); // Refresh to update session/UI
    } catch {
      toast.error("Gagal mengupload foto");
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const toggleSubtest = (id: string) => {
    setActiveSubtests((prev) => {
      if (id === "total") {
        return ["total"];
      }
      const newSubtests = prev.filter((sub) => sub !== "total");
      if (newSubtests.includes(id)) {
        return newSubtests.filter((sub) => sub !== id);
      } else {
        return [...newSubtests, id];
      }
    });
  };

  const chartData = {
    labels: scoreHistory.map((score) => score.to),
    datasets: subtests
      .filter(
        (subtest) =>
          activeSubtests.includes(subtest.id) ||
          activeSubtests.includes("total"),
      )
      .map((subtest) => {
        const color = subtest.color.replace("bg-", "").replace("-500", "");
        const colorMap: { [key: string]: string } = {
          blue: "#3B82F6",
          purple: "#A855F7",
          green: "#10B981",
          orange: "#F97316",
          red: "#EF4444",
          yellow: "#EAB308",
          indigo: "#6366F1",
          teal: "#14B8A6",
        };
        return {
          label: subtest.label,
          data: scoreHistory.map(
            (score) => score[subtest.id as keyof ScoreData],
          ),
          borderColor: colorMap[color as keyof typeof colorMap] || "blue",
          backgroundColor:
            (colorMap[color as keyof typeof colorMap] || "blue") + "33",
          fill: true,
          tension: 0.4,
        };
      }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const myTryouts = ongoingTryouts.filter((t) => t.isRegistered);
  const marketTryouts = [
    ...ongoingTryouts.filter((t) => !t.isRegistered),
    ...availableTryoutsData.filter(
      (at) => !ongoingTryouts.some((ot) => ot.id === at.id), // Avoid duplicates if API returns overlapping data
    ),
  ];

  return (
    <div className="min-h-screen pl-20 bg-gray-50/50 pt-24 pb-20 font-open-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar
                className="w-16 h-16 border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>

                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}

                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Halo, {session.user.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-500 mt-1">
                Siap untuk mengejar kampus impianmu hari ini?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-white border-blue-100 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl shadow-sm h-12"
              onClick={() => router.push("/shop")}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-blue-400 font-semibold uppercase">
                    Saldo Token
                  </p>
                  <p className="text-lg font-bold leading-none">
                    {userStats?.tokenBalance ?? 0}
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Tryout Dimiliki"
            value={myTryouts.length}
            icon={BookOpen}
            color="bg-blue-500"
          />
          <StatCard
            title="Rata-rata Skor"
            value={
              scoreHistory.length > 0
                ? Math.round(
                    scoreHistory.reduce((acc, curr) => acc + curr.total, 0) /
                      scoreHistory.length,
                  )
                : "-"
            }
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            title="Tryout Selesai"
            value={userStats?.totalFinished ?? 0}
            icon={CheckCircle2}
            color="bg-orange-500"
          />
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="my-tryouts" className="w-full space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border-0 shadow-sm ring-1 ring-gray-100/70 w-fit">
            <TabsTrigger
              value="my-tryouts"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
            >
              Tryout Saya
              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                {myTryouts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
            >
              Jelajahi Tryout
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
            >
              Riwayat Skor
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MY TRYOUTS */}
          <TabsContent
            value="my-tryouts"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            {myTryouts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myTryouts.map((tryout) => (
                  <Card
                    key={tryout.id}
                    className="border-0 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] ring-1 ring-gray-100/70 transition-all duration-300 hover:shadow-lg group overflow-hidden"
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          {tryout.status === "FINISHED" ? (
                            <Badge className="bg-green-500 text-white hover:bg-green-600 border-0 px-3 py-1">
                              Selesai
                            </Badge>
                          ) : tryout.status === "IN_PROGRESS" ? (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-3 py-1">
                              Sedang Dikerjakan
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 py-1">
                              Belum Dikerjakan
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-gray-200">
                            SNBT
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {tryout.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {tryout.scheduledStart
                              ? new Date(
                                  tryout.scheduledStart,
                                ).toLocaleDateString("id-ID")
                              : "Jadwal Fleksibel"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {tryout.participants} Peserta
                          </span>
                        </div>
                      </div>

                      <div className="p-6 pt-0 mt-auto">
                        <Button
                          className={`w-full ${tryout.status === "FINISHED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white shadow-lg h-12 text-base font-semibold`}
                          onClick={() => router.push(`/tryout/${tryout.id}`)}
                        >
                          {tryout.status === "FINISHED"
                            ? "Lihat Pembahasan"
                            : tryout.status === "IN_PROGRESS"
                              ? "Lanjutkan Ujian"
                              : "Kerjakan Sekarang"}
                          {tryout.status === "FINISHED" ? (
                            <BookOpen className="w-5 h-5 ml-2" />
                          ) : (
                            <ChevronRight className="w-5 h-5 ml-2" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-gray-50/50 shadow-sm ring-1 ring-gray-200/70">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Belum ada Tryout Aktif
                  </h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Kamu belum mendaftar tryout apapun. Yuk cari tryout yang
                    cocok buat kamu!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("explore-trigger")?.click()
                    }
                  >
                    Cari Tryout
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: EXPLORE / MARKETPLACE */}
          <TabsContent
            value="explore"
            className="space-y-6 animate-in fade-in-50 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketTryouts.map((tryout) => (
                <Card
                  key={tryout.id}
                  className="border-0 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] ring-1 ring-gray-100/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        className={`${
                          tryout.solutionPrice > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        } hover:bg-opacity-80 border-0`}
                      >
                        {tryout.solutionPrice > 0 ? "Premium" : "Gratis"}
                      </Badge>
                      <div className="text-sm font-bold text-gray-400">
                        #{tryout.title.match(/\d+/)?.[0] || "TO"}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-[3.5rem]">
                      {tryout.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tryout.participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {tryout.scheduledStart
                          ? new Date(tryout.scheduledStart).toLocaleDateString(
                              "id-ID",
                              { month: "short", day: "numeric" },
                            )
                          : "-"}
                      </span>
                    </div>

                    <Button
                      className="w-full justify-between group bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() =>
                        handleRegisterClick(tryout as OngoingTryout)
                      }
                    >
                      <span>Daftar Gratis</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="animate-in fade-in-50 duration-300"
          >
            <Card className="border-0 bg-white shadow-[0_14px_36px_-24px_rgba(15,23,42,0.35)] ring-1 ring-gray-100/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge
                    className={`cursor-pointer px-4 py-1.5 text-sm ${activeSubtests.includes("total") ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    onClick={() => toggleSubtest("total")}
                  >
                    Total
                  </Badge>
                  {subtests.map((subtest) => (
                    <Badge
                      key={subtest.id}
                      className={`cursor-pointer px-4 py-1.5 text-sm ${activeSubtests.includes(subtest.id) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      onClick={() => toggleSubtest(subtest.id)}
                    >
                      {subtest.label}
                    </Badge>
                  ))}
                </div>

                <div className="h-[400px] w-full">
                  {scoreHistory.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        Belum ada riwayat skor
                      </p>
                      <p className="text-gray-400 text-sm">
                        Selesaikan tryout untuk melihat grafik perkembanganmu
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onConfirm={onConfirmRegister}
        tryoutTitle={selectedTryout?.title || ""}
        tokenCost={selectedTryout?.solutionPrice || 0}
        isLoading={registerLoading}
        error={registerError}
      />
    </div>
  );
};

export default DashboardModule;
