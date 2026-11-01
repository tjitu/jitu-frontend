import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreDistributionChartProps {
  distribution: {
    under400: number;
    range400to600: number;
    range600to800: number;
    above800: number;
  };
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  distribution,
}) => {
  const data = {
    labels: ["< 400", "400–600", "600–800", "> 800"],
    datasets: [
      {
        label: "Jumlah Peserta",
        data: [
          distribution.under400,
          distribution.range400to600,
          distribution.range600to800,
          distribution.above800,
        ],
        backgroundColor: ["#6B778C", "#93BAFF", "#2557DB", "#FFC81F"],
        borderRadius: 6,
      },
    ],
  };

  const options = {
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribusi skor IRT</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
};
