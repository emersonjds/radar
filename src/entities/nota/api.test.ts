import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { definirNota, fetchNotasPorAvaliacao } from "./api";

describe("nota api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("upserts by (avaliacao, aluno) instead of duplicating", async () => {
    const base = { avaliacaoId: "avaliacao-x", alunoId: "aluno-1" };
    await definirNota({ ...base, valor: 6.5 });
    await definirNota({ ...base, valor: 8 });
    const notas = await fetchNotasPorAvaliacao("avaliacao-x");
    const doAluno = notas.filter((nota) => nota.alunoId === "aluno-1");
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].valor).toBe(8);
  });

  it("rejects a valor with more than one decimal place", async () => {
    await expect(
      definirNota({ avaliacaoId: "avaliacao-x", alunoId: "aluno-1", valor: 10.05 }),
    ).rejects.toThrow();
  });

  it("accepts null as pending", async () => {
    const nota = await definirNota({
      avaliacaoId: "avaliacao-x",
      alunoId: "aluno-2",
      valor: null,
    });
    expect(nota.valor).toBeNull();
  });
});
