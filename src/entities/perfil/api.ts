import { readCollection } from "@/shared/lib/storage/db";
import { perfilSchema, type Papel, type Perfil } from "./model";

export async function fetchPerfis(): Promise<Perfil[]> {
  const rows = await readCollection("perfis");
  return rows.map((row) => perfilSchema.parse(row));
}

export async function fetchPerfilPorPapel(papel: Papel): Promise<Perfil | null> {
  const perfis = await fetchPerfis();
  return perfis.find((perfil) => perfil.papel === papel) ?? null;
}
