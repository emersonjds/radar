import { beforeEach, describe, expect, it } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookComQuery } from "@/test/react-query";
import { useCriarChamada, useChamadasPorTurma } from "@/entities/chamada/queries";
import { useDefinirPresenca, usePresencasPorChamada } from "@/entities/presenca/queries";

describe("salvar chamada (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a session, upserts presence status, and never duplicates", async () => {
    const chamadaId = "chamada-turma-mat-b-2026-07-02";

    const { result: criar } = renderHookComQuery(() => useCriarChamada());
    await act(async () => {
      await criar.current.mutateAsync({
        turmaId: "turma-mat-b",
        data: "2026-07-02",
        professorId: "perfil-ricardo",
      });
      // Creating the same session twice must not duplicate it.
      await criar.current.mutateAsync({
        turmaId: "turma-mat-b",
        data: "2026-07-02",
        professorId: "perfil-ricardo",
      });
    });

    const { result: definir } = renderHookComQuery(() => useDefinirPresenca());
    await act(async () => {
      await definir.current.mutateAsync({
        chamadaId,
        alunoId: "aluno-1",
        status: "ausente",
      });
      await definir.current.mutateAsync({
        chamadaId,
        alunoId: "aluno-1",
        status: "presente",
      });
    });

    const { result: chamadas } = renderHookComQuery(() =>
      useChamadasPorTurma("turma-mat-b"),
    );
    await waitFor(() => expect(chamadas.current.isSuccess).toBe(true));
    const doDia = (chamadas.current.data ?? []).filter(
      (chamada) => chamada.data === "2026-07-02",
    );
    expect(doDia).toHaveLength(1);

    const { result: presencas } = renderHookComQuery(() =>
      usePresencasPorChamada(chamadaId),
    );
    await waitFor(() => expect(presencas.current.isSuccess).toBe(true));
    const doAluno = (presencas.current.data ?? []).filter(
      (presenca) => presenca.alunoId === "aluno-1",
    );
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].status).toBe("presente");
  });
});
