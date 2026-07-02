import { loadDb, type Perfil } from "@/shared/lib/store/db";

export async function listarProfessores(): Promise<Perfil[]> {
  const db = loadDb();
  return Promise.resolve(db.perfis.filter((perfil) => perfil.papel === "professor"));
}

export async function obterPerfil(id: string): Promise<Perfil | null> {
  const db = loadDb();
  return Promise.resolve(db.perfis.find((perfil) => perfil.id === id) ?? null);
}
