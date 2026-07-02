import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { criarChamada, fetchChamadasPorTurma } from "./api";

describe("chamada api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("is unique per (turma, data) — creating twice does not duplicate", async () => {
    const input = {
      turmaId: "turma-mat-b",
      data: "2026-07-02",
      professorId: "perfil-ricardo",
    };
    await criarChamada(input);
    await criarChamada(input);
    const chamadas = await fetchChamadasPorTurma("turma-mat-b");
    const doDia = chamadas.filter((chamada) => chamada.data === "2026-07-02");
    expect(doDia).toHaveLength(1);
  });

  it("rejects a malformed date", async () => {
    await expect(
      criarChamada({
        turmaId: "turma-mat-b",
        data: "02/07/2026",
        professorId: "perfil-ricardo",
      }),
    ).rejects.toThrow();
  });
});
