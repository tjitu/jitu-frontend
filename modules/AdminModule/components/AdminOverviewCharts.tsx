import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ChartItem {
  label: string;
  value: number;
}

interface AdminOverviewChartsProps {
  revenue: ChartItem[];
  userGrowth: ChartItem[];
  weeklyActivity: ChartItem[];
}

export const AdminOverviewCharts: React.FC<AdminOverviewChartsProps> = ({
  revenue,
  userGrowth,
  weeklyActivity,
}) => {
  const revenueData = {
    labels: revenue.map((i) => i.label),
    datasets: [
      {
        fill: true,
        label: "Pendapatan (Rp)",
        data: revenue.map((i) => i.value),
        borderColor: "#2557DB",
        backgroundColor: "rgba(37, 87, 219, 0.10)",
        tension: 0.25,
        borderWidth: 2,
      },
    ],
  };

  const userGrowthData = {
    labels: userGrowth.map((i) => i.label),
    datasets: [
      {
        fill: true,
        label: "Peserta Baru",
        data: userGrowth.map((i) => i.value),
        borderColor: "#2557DB",
        backgroundColor: "rgba(37, 87, 219, 0.10)",
        tension: 0.25,
        borderWidth: 2,
      },
    ],
  };

  const activityData = {
    labels: weeklyActivity.map((i) => i.label),
    datasets: [
      {
        label: "Aktivitas Harian",
        data: weeklyActivity.map((i) => i.value),
        backgroundColor: "#2557DB",
        borderRadius: 6,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#4E5B73", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#E9EDF4" },
        ticks: { precision: 0, color: "#4E5B73", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tren pendapatan (6 bulan)</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <Line data={revenueData} options={commonOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pertumbuhan peserta (6 bulan)</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <Line data={userGrowthData} options={commonOptions} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Aktivitas pengerjaan (7 hari terakhir)</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <Bar data={activityData} options={commonOptions} />
        </CardContent>
      </Card>
    </div>
  );
};
