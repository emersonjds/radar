import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "@/shared/lib/store/db";
import { abrirOuObterChamada } from "@/entities/chamada/api";
import { listarPresencasDaChamada, salvarPresencas } from "./api";

describe("salvarPresencas", () => {
  beforeEach(() => {
    resetDb();
  });

  it("upserts a single row per aluno instead of duplicating", async () => {
    const chamada = await abrirOuObterChamada("turma-1", "2026-07-01", "professor-1");

    await salvarPresencas(chamada.id, [{ alunoId: "aluno-1-1", status: "ausente" }]);
    await salvarPresencas(chamada.id, [{ alunoId: "aluno-1-1", status: "presente" }]);

    const presencas = await listarPresencasDaChamada(chamada.id);
    const doAluno = presencas.filter((presenca) => presenca.alunoId === "aluno-1-1");

    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("presente");
  });
});
