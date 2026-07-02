"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSessao } from "@/features/auth/use-sessao";
import { ChamadaForm } from "@/features/fazer-chamada/chamada-form";

function ChamadaContent() {
  const searchParams = useSearchParams();
  const turmaId = searchParams.get("turma") ?? "";
  const { perfil } = useSessao();

  if (!turmaId) {
    return <p className="p-4 text-sm text-gray-500">Turma não informada.</p>;
  }

  if (!perfil) {
    return <p className="p-4 text-sm text-gray-500">Carregando...</p>;
  }

  return <ChamadaForm turmaId={turmaId} professorId={perfil.id} />;
}

export default function ChamadaPage() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-gray-500">Carregando...</p>}>
      <ChamadaContent />
    </Suspense>
  );
}
