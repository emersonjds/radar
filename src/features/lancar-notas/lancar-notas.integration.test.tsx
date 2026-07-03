import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAvaliacoesPorTurma, useCriarAvaliacao } from "@/entities/avaliacao/queries";
import { useDefinirNota, useNotasPorAvaliacao } from "@/entities/nota/queries";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookComQuery } from "@/test/react-query";

const NOVA_AVALIACAO = {
  turmaId: "turma-mat-b",
  nome: "Prova E2E",
  data: "2026-07-02",
  peso: 2,
  professorId: "perfil-ricardo",
};

describe("lançar notas (integração)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates the avaliacao, upserts the nota and reflects it in the query", async () => {
    const criar = renderHookComQuery(() => useCriarAvaliacao());
    let avaliacaoId = "";
    await act(async () => {
      const avaliacao = await criar.result.current.mutateAsync(NOVA_AVALIACAO);
      avaliacaoId = avaliacao.id;
    });

    const definir = renderHookComQuery(() => useDefinirNota());
    await act(async () => {
      await definir.result.current.mutateAsync({ avaliacaoId, alunoId: "aluno-1", valor: 6.5 });
      await definir.result.current.mutateAsync({ avaliacaoId, alunoId: "aluno-1", valor: 8 });
    });

    const notas = renderHookComQuery(() => useNotasPorAvaliacao(avaliacaoId));
    await waitFor(() => expect(notas.result.current.isSuccess).toBe(true));
    const doAluno = (notas.result.current.data ?? []).filter(
      (nota) => nota.alunoId === "aluno-1",
    );
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].valor).toBe(8);
  });

  it("creating the same avaliacao twice does not duplicate it", async () => {
    const criar = renderHookComQuery(() => useCriarAvaliacao());
    await act(async () => {
      await criar.result.current.mutateAsync(NOVA_AVALIACAO);
      await criar.result.current.mutateAsync(NOVA_AVALIACAO);
    });

    const avaliacoes = renderHookComQuery(() => useAvaliacoesPorTurma("turma-mat-b"));
    await waitFor(() => expect(avaliacoes.result.current.isSuccess).toBe(true));
    const criadas = (avaliacoes.result.current.data ?? []).filter(
      (avaliacao) => avaliacao.nome === "Prova E2E",
    );
    expect(criadas).toHaveLength(1);
  });
});
