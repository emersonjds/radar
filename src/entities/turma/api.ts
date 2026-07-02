import { readCollection } from "@/shared/lib/storage/db";
import { turmaSchema, type Turma } from "./model";

export async function fetchTurmas(): Promise<Turma[]> {
  const rows = await readCollection("turmas");
  return rows.map((row) => turmaSchema.parse(row));
}

export async function fetchTurmaPorId(id: string): Promise<Turma | null> {
  const turmas = await fetchTurmas();
  return turmas.find((turma) => turma.id === id) ?? null;
}
