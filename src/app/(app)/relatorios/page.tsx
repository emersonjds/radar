"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAlunos } from "@/entities/aluno/queries";
import { useExigirPapel } from "@/features/sessao/use-exigir-papel";

export default function RelatoriosPage() {
  const permitido = useExigirPapel(["admin"]);
  const { data: alunos } = useAlunos();
  const router = useRouter();

  useEffect(() => {
    if (alunos?.[0]) router.replace("/relatorios/" + alunos[0].id);
  }, [alunos, router]);

  if (!permitido) return null;
  return <p>Carregando…</p>;
}
