import { beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookComQuery } from "@/test/react-query";
import { useAlunosPorTurma } from "./queries";

describe("useAlunosPorTurma (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns only students from the requested turma", async () => {
    const { result } = renderHookComQuery(() => useAlunosPorTurma("turma-mat-b"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const alunos = result.current.data ?? [];
    expect(alunos.length).toBeGreaterThan(0);
    expect(alunos.every((aluno) => aluno.turmaId === "turma-mat-b")).toBe(true);
  });
});
