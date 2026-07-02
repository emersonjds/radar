import { useQuery } from "@tanstack/react-query";
import { obterPerfil } from "@/entities/perfil/api";
import type { Perfil } from "@/shared/lib/store/db";
import { sessaoAtualId } from "./api";

export function useSessao(): { perfil: Perfil | null; carregando: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["sessao"],
    queryFn: () => {
      const id = sessaoAtualId();
      return id ? obterPerfil(id) : Promise.resolve(null);
    },
  });

  return { perfil: data ?? null, carregando: isLoading };
}
