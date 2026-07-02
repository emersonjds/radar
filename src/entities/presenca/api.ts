import { loadDb, saveDb, type Presenca, type StatusPresenca } from "@/shared/lib/store/db";

export async function listarPresencasDaChamada(chamadaId: string): Promise<Presenca[]> {
  const db = loadDb();
  return Promise.resolve(db.presencas.filter((presenca) => presenca.chamadaId === chamadaId));
}

export async function salvarPresencas(
  chamadaId: string,
  registros: { alunoId: string; status: StatusPresenca }[],
): Promise<void> {
  const db = loadDb();
  for (const registro of registros) {
    const existente = db.presencas.find(
      (presenca) => presenca.chamadaId === chamadaId && presenca.alunoId === registro.alunoId,
    );
    if (existente) {
      existente.status = registro.status;
    } else {
      db.presencas.push({ id: crypto.randomUUID(), chamadaId, alunoId: registro.alunoId, status: registro.status });
    }
  }
  saveDb(db);
  return Promise.resolve();
}
