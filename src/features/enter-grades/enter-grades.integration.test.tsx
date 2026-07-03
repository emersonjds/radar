import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAssessmentsByGroup, useCreateAssessment } from "@/entities/assessment/queries";
import { useSetGrade, useGradesByAssessment } from "@/entities/grade/queries";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookWithQuery } from "@/test/react-query";

const NOVA_AVALIACAO = {
  groupId: "turma-mat-b",
  name: "Prova E2E",
  date: "2026-07-02",
  weight: 2,
  teacherId: "perfil-ricardo",
};

describe("lançar notas (integração)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates the avaliacao, upserts the nota and reflects it in the query", async () => {
    const criar = renderHookWithQuery(() => useCreateAssessment());
    let assessmentId = "";
    await act(async () => {
      const avaliacao = await criar.result.current.mutateAsync(NOVA_AVALIACAO);
      assessmentId = avaliacao.id;
    });

    const definir = renderHookWithQuery(() => useSetGrade());
    await act(async () => {
      await definir.result.current.mutateAsync({ assessmentId, studentId: "aluno-1", value: 6.5 });
      await definir.result.current.mutateAsync({ assessmentId, studentId: "aluno-1", value: 8 });
    });

    const notas = renderHookWithQuery(() => useGradesByAssessment(assessmentId));
    await waitFor(() => expect(notas.result.current.isSuccess).toBe(true));
    const doAluno = (notas.result.current.data ?? []).filter(
      (nota) => nota.studentId === "aluno-1",
    );
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].value).toBe(8);
  });

  it("creating the same avaliacao twice does not duplicate it", async () => {
    const criar = renderHookWithQuery(() => useCreateAssessment());
    await act(async () => {
      await criar.result.current.mutateAsync(NOVA_AVALIACAO);
      await criar.result.current.mutateAsync(NOVA_AVALIACAO);
    });

    const avaliacoes = renderHookWithQuery(() => useAssessmentsByGroup("turma-mat-b"));
    await waitFor(() => expect(avaliacoes.result.current.isSuccess).toBe(true));
    const criadas = (avaliacoes.result.current.data ?? []).filter(
      (avaliacao) => avaliacao.name === "Prova E2E",
    );
    expect(criadas).toHaveLength(1);
  });
});
