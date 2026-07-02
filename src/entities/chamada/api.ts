import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { chamadaSchema, type Chamada } from "./model";

export async function fetchChamadas(): Promise<Chamada[]> {
  const rows = await readCollection("chamadas");
  return rows.map((row) => chamadaSchema.parse(row));
}

export async function fetchChamadasPorTurma(turmaId: string): Promise<Chamada[]> {
  const chamadas = await fetchChamadas();
  return chamadas
    .filter((chamada) => chamada.turmaId === turmaId)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export interface NovaChamada {
  turmaId: string;
  data: string;
  professorId: string;
}

/**
 * Create a class session. A session is unique per (turma, data) — creating one
 * that already exists returns the existing record instead of duplicating it.
 * The real uniqueness guard will live in Postgres constraints later.
 */
export async function criarChamada(input: NovaChamada): Promise<Chamada> {
  const chamada = chamadaSchema.parse({
    id: `chamada-${input.turmaId}-${input.data}`,
    ...input,
  });
  await mutateCollection<Chamada>("chamadas", (rows) => {
    const exists = rows.some(
      (row) => row.turmaId === chamada.turmaId && row.data === chamada.data,
    );
    return exists ? rows : [...rows, chamada];
  });
  return chamada;
}
