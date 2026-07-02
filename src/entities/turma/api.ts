import { loadDb, saveDb, type Turma } from "@/shared/lib/store/db";

export async function listarTurmasDoProfessor(professorId: string): Promise<Turma[]> {
  const db = loadDb();
  return Promise.resolve(db.turmas.filter((turma) => turma.professorId === professorId));
}

export async function listarTodasTurmas(): Promise<Turma[]> {
  const db = loadDb();
  return Promise.resolve([...db.turmas]);
}

export async function criarTurma(input: Omit<Turma, "id">): Promise<Turma> {
  const db = loadDb();
  const turma: Turma = { ...input, id: crypto.randomUUID() };
  db.turmas.push(turma);
  saveDb(db);
  return Promise.resolve(turma);
}

export async function atualizarTurma(id: string, patch: Partial<Omit<Turma, "id">>): Promise<Turma> {
  const db = loadDb();
  const turma = db.turmas.find((item) => item.id === id);
  if (!turma) {
    throw new Error(`Turma não encontrada: ${id}`);
  }
  Object.assign(turma, patch);
  saveDb(db);
  return Promise.resolve(turma);
}
