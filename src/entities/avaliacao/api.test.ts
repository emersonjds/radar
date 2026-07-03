import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { criarAvaliacao, fetchAvaliacoesPorTurma } from "./api";

describe("avaliacao api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("is unique per (turma, nome, data) — creating twice does not duplicate", async () => {
    const input = {
      turmaId: "turma-mat-b",
      nome: "Prova Única",
      data: "2026-07-10",
      peso: 2,
      professorId: "perfil-ricardo",
    };
    await criarAvaliacao(input);
    await criarAvaliacao(input);
    const avaliacoes = await fetchAvaliacoesPorTurma("turma-mat-b");
    const criadas = avaliacoes.filter((avaliacao) => avaliacao.data === "2026-07-10");
    expect(criadas).toHaveLength(1);
  });

  it("slugs accented names into a stable deterministic id", async () => {
    const criada = await criarAvaliacao({
      turmaId: "turma-mat-b",
      nome: "Avaliação de Ciências",
      data: "2026-07-11",
      peso: 1,
      professorId: "perfil-ricardo",
    });
    expect(criada.id).toBe("avaliacao-turma-mat-b-avaliacao-de-ciencias-2026-07-11");
  });

  it("rejects peso outside 1..3", async () => {
    await expect(
      criarAvaliacao({
        turmaId: "turma-mat-b",
        nome: "Prova",
        data: "2026-07-10",
        peso: 0,
        professorId: "perfil-ricardo",
      }),
    ).rejects.toThrow();
  });
});
