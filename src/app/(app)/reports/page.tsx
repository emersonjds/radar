"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { ReportsList } from "@/widgets/reports-list/ReportsList";

export default function RelatoriosPage() {
  const permitido = useRequireRole(["admin", "coordinator"]);
  if (!permitido) return null;
  return <ReportsList />;
}
