"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTurmaPorId, fetchTurmas } from "./api";

export const turmaKeys = {
  all: ["turmas"],
  porId: (id: string) => ["turmas", id],
};

export function useTurmas() {
  return useQuery({ queryKey: turmaKeys.all, queryFn: fetchTurmas });
}

export function useTurma(id: string) {
  return useQuery({
    queryKey: turmaKeys.porId(id),
    queryFn: () => fetchTurmaPorId(id),
    enabled: Boolean(id),
  });
}
