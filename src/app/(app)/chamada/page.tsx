"use client";

import { ChamadaForm } from "@/features/fazer-chamada/ChamadaForm";
import { useExigirPapel } from "@/features/sessao/use-exigir-papel";

export default function ChamadaPage() {
  const permitido = useExigirPapel(["professor"]);
  if (!permitido) return null;
  return <ChamadaForm />;
}
