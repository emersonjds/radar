"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listarTurmasDoProfessor } from "@/entities/turma/api";
import { useSessao } from "@/features/auth/use-sessao";

const TURNOS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export default function TurmasPage() {
  const { perfil } = useSessao();
  const professorId = perfil?.id ?? "";

  const { data: turmas, isLoading } = useQuery({
    queryKey: ["turmas-do-professor", professorId],
    queryFn: () => listarTurmasDoProfessor(professorId),
    enabled: Boolean(professorId),
  });

  if (isLoading) {
    return <p className="text-sm text-gray-500">Carregando turmas...</p>;
  }

  if (!turmas || turmas.length === 0) {
    return <p className="text-sm text-gray-500">Você ainda não tem turmas cadastradas.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-gray-900">Minhas turmas</h1>
      {turmas.map((turma) => (
        <Link
          key={turma.id}
          href={`/professor/chamada?turma=${turma.id}`}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50"
        >
          <p className="font-medium text-gray-900">{turma.nome}</p>
          <p className="text-sm text-gray-500">
            {turma.serie} · {TURNOS[turma.turno]}
          </p>
        </Link>
      ))}
    </div>
  );
}
