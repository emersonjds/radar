"use client";

import dynamic from "next/dynamic";
import { usePapel } from "@/features/sessao/session-store";

// Code-split each persona's home so a professor never ships the admin charts.
const DashboardProfessor = dynamic(() =>
  import("@/widgets/dashboard-professor/DashboardProfessor").then(
    (mod) => mod.DashboardProfessor,
  ),
);
const PainelAdmin = dynamic(() =>
  import("@/widgets/painel-admin/PainelAdmin").then((mod) => mod.PainelAdmin),
);

export default function HomePage() {
  const papel = usePapel();
  return papel === "admin" ? <PainelAdmin /> : <DashboardProfessor />;
}
