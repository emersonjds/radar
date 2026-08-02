import { beforeEach, describe, expect, it } from "vitest";
import { mutateCollection, resetDb } from "@/shared/lib/storage/db";
import { createEvaluation, deleteEvaluation, fetchEvaluationsByAssignment } from "./api";

const base = {
  groupId: "turma-mat-b",
  subjectId: "materia-matematica",
  type: "exam",
  date: "2026-07-01",
  weight: 3,
} as const;

describe("evaluation api (over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates an evaluation for a lecionamento", async () => {
    const created = await createEvaluation({ ...base, name: "P1" });
    const list = await fetchEvaluationsByAssignment(base.groupId, base.subjectId);
    expect(list.some((e) => e.id === created.id && e.name === "P1")).toBe(true);
  });

  it("rejects a duplicate (group, subject, name, date)", async () => {
    await createEvaluation({ ...base, name: "P1" });
    await expect(createEvaluation({ ...base, name: "P1" })).rejects.toThrow();
  });

  it("cascade-deletes the evaluation's grades", async () => {
    const created = await createEvaluation({ ...base, name: "P1" });
    await mutateCollection("evaluationGrades", (rows) => [
      ...rows,
      { id: "eg-x", evaluationId: created.id, studentId: "aluno-1", score: 8 },
    ]);
    await deleteEvaluation(created.id);
    const remaining = await mutateCollection("evaluationGrades", (rows) => rows);
    expect(
      remaining.some((row) => (row as { evaluationId: string }).evaluationId === created.id),
    ).toBe(false);
  });
});
