import { describe, it, expect, beforeEach } from "vitest";
import { loadDb, saveDb, resetDb } from "./db";
import { alunosEmRisco } from "./analytics";

describe("db", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds the store on first load", () => {
    resetDb();
    const db = loadDb();
    expect(db.turmas.length).toBeGreaterThan(0);
    expect(db.alunos.length).toBeGreaterThan(0);
    expect(db.chamadas.length).toBeGreaterThan(0);
  });

  it("round-trips through saveDb", () => {
    const db = loadDb();
    const withExtraTurma = { ...db, turmas: [...db.turmas, { id: "turma-x", nome: "Extra", serie: "1", turno: "manha" as const, professorId: "professor-1" }] };
    saveDb(withExtraTurma);
    const reloaded = loadDb();
    expect(reloaded.turmas.some((turma) => turma.id === "turma-x")).toBe(true);
  });

  it("has at least one student above 25% absence in the seed", () => {
    resetDb();
    const risco = alunosEmRisco(loadDb(), 25);
    expect(risco.length).toBeGreaterThan(0);
  });
});
