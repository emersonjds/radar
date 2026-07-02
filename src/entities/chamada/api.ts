import { loadDb, saveDb, type Chamada } from "@/shared/lib/store/db";

export async function abrirOuObterChamada(turmaId: string, data: string, professorId: string): Promise<Chamada> {
  const db = loadDb();
  const existente = db.chamadas.find((chamada) => chamada.turmaId === turmaId && chamada.data === data);
  if (existente) {
    return Promise.resolve(existente);
  }
  const chamada: Chamada = { id: crypto.randomUUID(), turmaId, data, professorId };
  db.chamadas.push(chamada);
  saveDb(db);
  return Promise.resolve(chamada);
}
