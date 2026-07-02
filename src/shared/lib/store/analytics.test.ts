import { describe, it, expect } from "vitest";
import { frequenciaPorTurma, alunosEmRisco } from "./analytics";
import type { RadarDb } from "./db";

const db: RadarDb = {
  perfis: [], turmas: [{ id: "t1", nome: "3ºA", serie: "3", turno: "manha", professorId: "p1" }],
  alunos: [
    { id: "a1", nome: "Ana", matricula: "001", turmaId: "t1", ativo: true },
    { id: "a2", nome: "Beto", matricula: "002", turmaId: "t1", ativo: true },
  ],
  chamadas: [{ id: "c1", turmaId: "t1", data: "2026-06-01", professorId: "p1" }],
  presencas: [
    { id: "x1", chamadaId: "c1", alunoId: "a1", status: "presente" },
    { id: "x2", chamadaId: "c1", alunoId: "a2", status: "ausente" },
  ],
};

describe("analytics", () => {
  it("computes turma frequency", () => {
    expect(frequenciaPorTurma(db)[0]).toMatchObject({ turmaId: "t1", total: 2, presentes: 1, pct: 50 });
  });
  it("flags students above the absence limit", () => {
    const risco = alunosEmRisco(db, 40);
    expect(risco.map((r) => r.alunoId)).toContain("a2");
    expect(risco.map((r) => r.alunoId)).not.toContain("a1");
  });
});
