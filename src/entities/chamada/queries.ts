"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  criarChamada,
  fetchChamadas,
  fetchChamadasPorTurma,
} from "./api";

export const chamadaKeys = {
  all: ["chamadas"],
  porTurma: (turmaId: string) => ["chamadas", "turma", turmaId],
};

export function useChamadas() {
  return useQuery({ queryKey: chamadaKeys.all, queryFn: fetchChamadas });
}

export function useChamadasPorTurma(turmaId: string) {
  return useQuery({
    queryKey: chamadaKeys.porTurma(turmaId),
    queryFn: () => fetchChamadasPorTurma(turmaId),
    enabled: Boolean(turmaId),
  });
}

export function useCriarChamada() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarChamada,
    onSuccess: (chamada) => {
      queryClient.invalidateQueries({ queryKey: chamadaKeys.all });
      queryClient.invalidateQueries({
        queryKey: chamadaKeys.porTurma(chamada.turmaId),
      });
    },
  });
}
