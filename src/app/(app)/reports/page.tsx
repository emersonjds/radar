"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudents } from "@/entities/student/queries";
import { useRequireRole } from "@/features/session/use-require-role";

export default function RelatoriosPage() {
  const permitido = useRequireRole(["admin", "coordinator"]);
  const { data: alunos } = useStudents();
  const router = useRouter();

  useEffect(() => {
    if (alunos?.[0]) router.replace("/reports/" + alunos[0].id);
  }, [alunos, router]);

  if (!permitido) return null;
  return <p>Carregando…</p>;
}
