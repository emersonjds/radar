import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import {
  presencaSchema,
  type Presenca,
  type StatusPresenca,
} from "./model";

export async function fetchPresencas(): Promise<Presenca[]> {
  const rows = await readCollection("presencas");
  return rows.map((row) => presencaSchema.parse(row));
}

export async function fetchPresencasPorChamada(
  chamadaId: string,
): Promise<Presenca[]> {
  const presencas = await fetchPresencas();
  return presencas.filter((presenca) => presenca.chamadaId === chamadaId);
}

export async function fetchPresencasPorAluno(
  alunoId: string,
): Promise<Presenca[]> {
  const presencas = await fetchPresencas();
  return presencas.filter((presenca) => presenca.alunoId === alunoId);
}

/**
 * Set a student's status in a session. Unique per (chamada, aluno) — an existing
 * record is updated in place instead of duplicated (server constraint later).
 */
export async function definirPresenca(input: {
  chamadaId: string;
  alunoId: string;
  status: StatusPresenca;
}): Promise<Presenca> {
  const presenca = presencaSchema.parse({
    id: `presenca-${input.chamadaId}-${input.alunoId}`,
    ...input,
  });
  await mutateCollection<Presenca>("presencas", (rows) => {
    const index = rows.findIndex(
      (row) =>
        row.chamadaId === presenca.chamadaId && row.alunoId === presenca.alunoId,
    );
    if (index === -1) return [...rows, presenca];
    const next = [...rows];
    next[index] = presenca;
    return next;
  });
  return presenca;
}
