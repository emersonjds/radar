import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { notaSchema, type Nota } from "./model";

export async function fetchNotas(): Promise<Nota[]> {
  const rows = await readCollection("notas");
  return rows.map((row) => notaSchema.parse(row));
}

export async function fetchNotasPorAvaliacao(
  avaliacaoId: string,
): Promise<Nota[]> {
  const notas = await fetchNotas();
  return notas.filter((nota) => nota.avaliacaoId === avaliacaoId);
}

export async function fetchNotasPorAluno(alunoId: string): Promise<Nota[]> {
  const notas = await fetchNotas();
  return notas.filter((nota) => nota.alunoId === alunoId);
}

/**
 * Set a student's grade in an assessment. Unique per (avaliacao, aluno) — an
 * existing record is updated in place (server constraint later).
 */
export async function definirNota(input: {
  avaliacaoId: string;
  alunoId: string;
  valor: number | null;
}): Promise<Nota> {
  const nota = notaSchema.parse({
    id: `nota-${input.avaliacaoId}-${input.alunoId}`,
    ...input,
  });
  await mutateCollection<Nota>("notas", (rows) => {
    const index = rows.findIndex((row) => row.id === nota.id);
    if (index === -1) return [...rows, nota];
    const next = [...rows];
    next[index] = nota;
    return next;
  });
  return nota;
}
