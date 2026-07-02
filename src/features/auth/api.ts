import { loadDb, type Perfil } from "@/shared/lib/store/db";
import { queryClient } from "@/shared/providers/query-provider";

const SESSAO_KEY = "radar.sessao";

export async function entrar(email: string): Promise<Perfil> {
  const perfil = loadDb().perfis.find((candidato) => candidato.email === email);
  if (!perfil) {
    throw new Error("Nenhum perfil encontrado para este e-mail");
  }
  localStorage.setItem(SESSAO_KEY, perfil.id);
  queryClient.removeQueries({ queryKey: ["sessao"] });
  return perfil;
}

export function sair(): void {
  localStorage.removeItem(SESSAO_KEY);
  queryClient.removeQueries({ queryKey: ["sessao"] });
}

export function sessaoAtualId(): string | null {
  return localStorage.getItem(SESSAO_KEY);
}
