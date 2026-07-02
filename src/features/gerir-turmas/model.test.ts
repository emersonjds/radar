import { describe, it, expect } from "vitest";
import { turmaFormSchema } from "./model";

const valida = { nome: "6º Ano A", serie: "6º Ano", turno: "manha", professorId: "prof-1" };

describe("turmaFormSchema", () => {
  it("aceita uma turma válida", () => {
    expect(turmaFormSchema.safeParse(valida).success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const result = turmaFormSchema.safeParse({ ...valida, nome: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita turno inválido", () => {
    const result = turmaFormSchema.safeParse({ ...valida, turno: "madrugada" });
    expect(result.success).toBe(false);
  });
});
