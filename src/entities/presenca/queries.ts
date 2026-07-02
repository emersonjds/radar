"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  definirPresenca,
  fetchPresencas,
  fetchPresencasPorAluno,
  fetchPresencasPorChamada,
} from "./api";

export const presencaKeys = {
  all: ["presencas"] as const,
  porChamada: (chamadaId: string) =>
    ["presencas", "chamada", chamadaId] as const,
  porAluno: (alunoId: string) => ["presencas", "aluno", alunoId] as const,
};

export function usePresencas() {
  return useQuery({ queryKey: presencaKeys.all, queryFn: fetchPresencas });
}

export function usePresencasPorChamada(chamadaId: string) {
  return useQuery({
    queryKey: presencaKeys.porChamada(chamadaId),
    queryFn: () => fetchPresencasPorChamada(chamadaId),
    enabled: Boolean(chamadaId),
  });
}

export function usePresencasPorAluno(alunoId: string) {
  return useQuery({
    queryKey: presencaKeys.porAluno(alunoId),
    queryFn: () => fetchPresencasPorAluno(alunoId),
    enabled: Boolean(alunoId),
  });
}

export function useDefinirPresenca() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: definirPresenca,
    onSuccess: (presenca) => {
      queryClient.invalidateQueries({ queryKey: presencaKeys.all });
      queryClient.invalidateQueries({
        queryKey: presencaKeys.porChamada(presenca.chamadaId),
      });
      queryClient.invalidateQueries({
        queryKey: presencaKeys.porAluno(presenca.alunoId),
      });
    },
  });
}
