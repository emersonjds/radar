import { readCollection } from "@/shared/lib/storage/db";
import { alunoSchema, type Aluno } from "./model";

export async function fetchAlunos(): Promise<Aluno[]> {
  const rows = await readCollection("alunos");
  return rows.map((row) => alunoSchema.parse(row));
}

export async function fetchAlunosPorTurma(turmaId: string): Promise<Aluno[]> {
  const alunos = await fetchAlunos();
  return alunos.filter((aluno) => aluno.turmaId === turmaId);
}

export async function fetchAlunoPorId(id: string): Promise<Aluno | null> {
  const alunos = await fetchAlunos();
  return alunos.find((aluno) => aluno.id === id) ?? null;
}
