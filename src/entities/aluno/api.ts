import { loadDb, saveDb, type Aluno } from "@/shared/lib/store/db";

export async function listarAlunosDaTurma(turmaId: string): Promise<Aluno[]> {
  const db = loadDb();
  return Promise.resolve(db.alunos.filter((aluno) => aluno.turmaId === turmaId));
}

export async function criarAluno(input: Omit<Aluno, "id">): Promise<Aluno> {
  const db = loadDb();
  const aluno: Aluno = { ...input, id: crypto.randomUUID() };
  db.alunos.push(aluno);
  saveDb(db);
  return Promise.resolve(aluno);
}

export async function atualizarAluno(id: string, patch: Partial<Omit<Aluno, "id">>): Promise<Aluno> {
  const db = loadDb();
  const aluno = db.alunos.find((item) => item.id === id);
  if (!aluno) {
    throw new Error(`Aluno não encontrado: ${id}`);
  }
  Object.assign(aluno, patch);
  saveDb(db);
  return Promise.resolve(aluno);
}
