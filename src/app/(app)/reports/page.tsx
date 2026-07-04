"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { ReportsCenter } from "@/widgets/reports/ReportsCenter";

export default function RelatoriosPage() {
  const permitido = useRequireRole(["admin", "coordinator"]);
  if (!permitido) return null;
  return <ReportsCenter />;
}
