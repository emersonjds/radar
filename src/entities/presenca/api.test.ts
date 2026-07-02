import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { definirPresenca, fetchPresencasPorChamada } from "./api";

describe("presenca api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("upserts by (chamada, aluno) instead of duplicating", async () => {
    const base = { chamadaId: "chamada-x", alunoId: "aluno-1" } as const;
    await definirPresenca({ ...base, status: "ausente" });
    await definirPresenca({ ...base, status: "presente" });
    const presencas = await fetchPresencasPorChamada("chamada-x");
    const doAluno = presencas.filter((p) => p.alunoId === "aluno-1");
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("presente");
  });
});
