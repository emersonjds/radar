"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { criarAvaliacao, fetchAvaliacoesPorTurma } from "./api";

export const avaliacaoKeys = {
  all: ["avaliacoes"] as const,
  porTurma: (turmaId: string) => ["avaliacoes", "turma", turmaId] as const,
};

export function useAvaliacoesPorTurma(turmaId: string) {
  return useQuery({
    queryKey: avaliacaoKeys.porTurma(turmaId),
    queryFn: () => fetchAvaliacoesPorTurma(turmaId),
    enabled: Boolean(turmaId),
  });
}

export function useCriarAvaliacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarAvaliacao,
    onSuccess: (avaliacao) => {
      queryClient.invalidateQueries({ queryKey: avaliacaoKeys.all });
      queryClient.invalidateQueries({
        queryKey: avaliacaoKeys.porTurma(avaliacao.turmaId),
      });
    },
  });
}
