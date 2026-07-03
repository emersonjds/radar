"use client";

import { AssessmentsView } from "@/features/enter-grades/AssessmentsView";
import { useRequireRole } from "@/features/session/use-require-role";

export default function AvaliacoesPage() {
  const permitido = useRequireRole(["teacher"]);
  if (!permitido) return null;
  return <AssessmentsView />;
}
