"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreHistoryChartProps {
  data: ChartData<"line">;
  options: ChartOptions<"line">;
}

export default function ScoreHistoryChart({ data, options }: ScoreHistoryChartProps) {
  return <Line data={data} options={options} />;
}
