"use client";

import { AvaliacoesView } from "@/features/lancar-notas/AvaliacoesView";
import { useExigirPapel } from "@/features/sessao/use-exigir-papel";

export default function AvaliacoesPage() {
  const permitido = useExigirPapel(["professor"]);
  if (!permitido) return null;
  return <AvaliacoesView />;
}
