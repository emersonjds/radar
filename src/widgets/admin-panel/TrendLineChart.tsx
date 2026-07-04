"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { formatDate } from "@/shared/lib/format";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface TrendLineChartProps {
  pontos: { data: string; attendance: number }[];
}

export function TrendLineChart({ pontos }: TrendLineChartProps) {
  const options: ApexOptions = {
    chart: { type: "area", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#465fff"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0 } },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: pontos.map((ponto) => formatDate(ponto.data)),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { max: 100, labels: { formatter: (valor) => `${Math.round(valor)}%` } },
    grid: { borderColor: "#f2f4f7" },
    tooltip: { y: { formatter: (valor) => `${Math.round(valor)}%` } },
  };

  const series = [{ name: "Frequência", data: pontos.map((ponto) => Math.round(ponto.attendance)) }];

  return <ReactApexChart options={options} series={series} type="area" height={230} />;
}
