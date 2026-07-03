"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  definirNota,
  fetchNotasPorAluno,
  fetchNotasPorAvaliacao,
} from "./api";

export const notaKeys = {
  all: ["notas"] as const,
  porAvaliacao: (avaliacaoId: string) =>
    ["notas", "avaliacao", avaliacaoId] as const,
  porAluno: (alunoId: string) => ["notas", "aluno", alunoId] as const,
};

export function useNotasPorAvaliacao(avaliacaoId: string) {
  return useQuery({
    queryKey: notaKeys.porAvaliacao(avaliacaoId),
    queryFn: () => fetchNotasPorAvaliacao(avaliacaoId),
    enabled: Boolean(avaliacaoId),
  });
}

export function useNotasPorAluno(alunoId: string) {
  return useQuery({
    queryKey: notaKeys.porAluno(alunoId),
    queryFn: () => fetchNotasPorAluno(alunoId),
    enabled: Boolean(alunoId),
  });
}

export function useDefinirNota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: definirNota,
    onSuccess: (nota) => {
      queryClient.invalidateQueries({ queryKey: notaKeys.all });
      queryClient.invalidateQueries({
        queryKey: notaKeys.porAvaliacao(nota.avaliacaoId),
      });
      queryClient.invalidateQueries({
        queryKey: notaKeys.porAluno(nota.alunoId),
      });
    },
  });
}
