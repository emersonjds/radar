"use client";

import { useExigirPapel } from "@/features/sessao/use-exigir-papel";
import { DetalheAluno } from "@/widgets/detalhe-aluno/DetalheAluno";

export default function RelatoriosPage() {
  const permitido = useExigirPapel(["admin"]);
  if (!permitido) return null;
  return <DetalheAluno />;
}
