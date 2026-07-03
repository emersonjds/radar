"use client";

import { useParams } from "next/navigation";
import { useExigirPapel } from "@/features/sessao/use-exigir-papel";
import { DetalheAluno } from "@/widgets/detalhe-aluno/DetalheAluno";

export default function RelatorioAlunoPage() {
  const permitido = useExigirPapel(["admin"]);
  const params = useParams();
  if (!permitido) return null;
  return <DetalheAluno alunoId={String(params.alunoId)} />;
}
