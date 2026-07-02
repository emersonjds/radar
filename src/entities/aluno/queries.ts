"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAlunoPorId, fetchAlunos, fetchAlunosPorTurma } from "./api";

export const alunoKeys = {
  all: ["alunos"] as const,
  porTurma: (turmaId: string) => ["alunos", "turma", turmaId] as const,
  porId: (id: string) => ["alunos", id] as const,
};

export function useAlunos() {
  return useQuery({ queryKey: alunoKeys.all, queryFn: fetchAlunos });
}

export function useAlunosPorTurma(turmaId: string) {
  return useQuery({
    queryKey: alunoKeys.porTurma(turmaId),
    queryFn: () => fetchAlunosPorTurma(turmaId),
    enabled: Boolean(turmaId),
  });
}

export function useAluno(id: string) {
  return useQuery({
    queryKey: alunoKeys.porId(id),
    queryFn: () => fetchAlunoPorId(id),
    enabled: Boolean(id),
  });
}
