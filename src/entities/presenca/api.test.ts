import { describe, it, expect, beforeEach } from "vitest";
import { loadDb, saveDb, resetDb, type Chamada } from "@/shared/lib/store/db";
import { listarPresencasDaChamada, salvarPresencas } from "./api";

describe("salvarPresencas", () => {
  let chamada: Chamada;

  beforeEach(() => {
    resetDb();
    chamada = { id: crypto.randomUUID(), turmaId: "turma-1", data: "2026-07-01", professorId: "professor-1" };
    const db = loadDb();
    db.chamadas.push(chamada);
    saveDb(db);
  });

  it("upserts a single row per aluno instead of duplicating", async () => {
    await salvarPresencas(chamada.id, [{ alunoId: "aluno-1-1", status: "ausente" }]);
    await salvarPresencas(chamada.id, [{ alunoId: "aluno-1-1", status: "presente" }]);

    const presencas = await listarPresencasDaChamada(chamada.id);
    const doAluno = presencas.filter((presenca) => presenca.alunoId === "aluno-1-1");

    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("presente");
  });
});
