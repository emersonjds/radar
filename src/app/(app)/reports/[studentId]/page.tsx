"use client";

import { useParams } from "next/navigation";
import { useRequireRole } from "@/features/session/use-require-role";
import { StudentDetail } from "@/widgets/student-detail/StudentDetail";

export default function RelatorioAlunoPage() {
  const permitido = useRequireRole(["admin", "coordinator"]);
  const params = useParams();
  if (!permitido) return null;
  return <StudentDetail studentId={String(params.studentId)} />;
}
