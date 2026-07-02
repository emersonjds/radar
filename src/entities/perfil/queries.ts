"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPerfilPorPapel, fetchPerfis } from "./api";
import type { Papel } from "./model";

export const perfilKeys = {
  all: ["perfis"] as const,
  porPapel: (papel: Papel) => ["perfis", "papel", papel] as const,
};

export function usePerfis() {
  return useQuery({ queryKey: perfilKeys.all, queryFn: fetchPerfis });
}

export function usePerfilPorPapel(papel: Papel) {
  return useQuery({
    queryKey: perfilKeys.porPapel(papel),
    queryFn: () => fetchPerfilPorPapel(papel),
  });
}
