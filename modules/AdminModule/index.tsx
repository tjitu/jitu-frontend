"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { StatCard } from "@/components/elements/Admin/StatCard";
import { getTryoutStats } from "@/lib/api/AdminTryoutApi";
import { Badge } from "@/components/ui/badge";
import { AdminOverviewCharts } from "./components/AdminOverviewCharts";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalTryout: number;
  totalActiveTryout: number;
  totalUpcomingTryout: number;
  totalEndedTryout: number;
  totalUser: number;
  activeUser: number;
  totalAdmin: number;
  totalRevenue: number;
  totalPendingPayment: number;
  charts: {
    revenue: { label: string; value: number }[];
    userGrowth: { label: string; value: number }[];
    weeklyActivity: { label: string; value: number }[];
  };
}

const AdminModule = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getTryoutStats();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error("Data gagal dimuat. Muat ulang halaman.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      label: "Buat tryout baru",
      description: "Tambah paket simulasi UTBK-SNBT baru",
      href: "/admin/create-to",
    },
    {
      label: "Kelola pembayaran",
      description: `${stats?.totalPendingPayment || 0} transaksi menunggu verifikasi`,
      href: "/admin/payments",
    },
    {
      label: "Atur paket kuota",
      description: "Ubah nominal kuota dan harga paket QRIS",
      href: "/admin/packages",
    },
    {
      label: "Soal latihan harian",
      description: "Kelola bank soal harian peserta",
      href: "/admin/daily",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-slate-600">
          MEMUAT RINGKASAN ADMIN...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b-2 border-blue-900">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-blue-600 mb-1">
          PANEL ADMIN · JITU.
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-blue-900">
          Ringkasan operasional
        </h1>
        <p className="text-sm text-slate-700 mt-1">
          Statistik peserta, sesi tryout aktif, dan transaksi kuota.
        </p>
      </div>

      {/* 4-up Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL PESERTA"
          value={(stats?.totalUser || 0).toLocaleString("id-ID")}
          suffix="terdaftar"
        />
        <StatCard
          label="TOTAL TRYOUT"
          value={stats?.totalTryout || 0}
          suffix={`${stats?.totalActiveTryout || 0} aktif`}
        />
        <StatCard
          label="PENDAPATAN LUNAS"
          value={`Rp${(stats?.totalRevenue || 0).toLocaleString("id-ID")}`}
          suffix="terkonfirmasi"
        />
        <StatCard
          label="MENUNGGU BAYAR"
          value={stats?.totalPendingPayment || 0}
          suffix="transaksi pending"
        />
      </div>

      {/* Statistical Charts */}
      {stats?.charts && (
        <AdminOverviewCharts
          revenue={stats.charts.revenue}
          userGrowth={stats.charts.userGrowth}
          weeklyActivity={stats.charts.weeklyActivity}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions Grid */}
        <div className="lg:col-span-8 space-y-3">
          <h2 className="font-display text-lg font-bold text-blue-900">
            Pintasan menu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                href={action.href}
                key={index}
                className="bg-white border-2 border-blue-900 p-5 hover:bg-blue-50 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-display font-bold text-blue-900 text-base">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-700 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Status sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-slate-600 uppercase">DATABASE</span>
                <Badge variant="success">ONLINE</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-100">
                <span className="text-slate-600 uppercase">SESI AKTIF</span>
                <span className="font-medium text-blue-900">
                  {stats?.totalActiveTryout || 0} tryout
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 uppercase">ADMIN</span>
                <span className="font-medium text-blue-900">
                  {stats?.totalAdmin || 0} akun
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminModule;
