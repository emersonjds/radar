"use client";

import { usePerfilPorPapel } from "@/entities/perfil/queries";
import type { Papel, Perfil } from "@/entities/perfil/model";
import { setPapel, usePapel } from "./session-store";

export interface Sessao {
  papel: Papel;
  perfil: Perfil | null;
  carregando: boolean;
  trocarPapel: (papel: Papel) => void;
}

export function useSessao(): Sessao {
  const papel = usePapel();
  const { data: perfil, isLoading } = usePerfilPorPapel(papel);
  return {
    papel,
    perfil: perfil ?? null,
    carregando: isLoading,
    trocarPapel: setPapel,
  };
}
