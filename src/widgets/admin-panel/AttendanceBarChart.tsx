"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface AttendanceBarChartProps {
  dados: { groupId: string; label: string; attendance: number }[];
}

export function AttendanceBarChart({ dados }: AttendanceBarChartProps) {
  const options: ApexOptions = {
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#465fff"],
    plotOptions: { bar: { borderRadius: 5, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: dados.map((ponto) => ponto.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { max: 100, labels: { formatter: (valor) => `${Math.round(valor)}%` } },
    grid: { borderColor: "#f2f4f7", yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (valor) => `${Math.round(valor)}%` } },
  };

  const series = [{ name: "Frequência", data: dados.map((ponto) => Math.round(ponto.attendance)) }];

  return <ReactApexChart options={options} series={series} type="bar" height={230} />;
}
