import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { fetchEvaluationGradesByEvaluation, setEvaluationGrade } from "./api";

describe("evaluation-grade api (over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("sets a grade for a student on an evaluation", async () => {
    await setEvaluationGrade({ evaluationId: "eval-1", studentId: "aluno-1", score: 7.5 });
    const grades = await fetchEvaluationGradesByEvaluation("eval-1");
    expect(grades).toHaveLength(1);
    expect(grades[0].score).toBe(7.5);
  });

  it("upserts (one row per student per evaluation)", async () => {
    await setEvaluationGrade({ evaluationId: "eval-1", studentId: "aluno-1", score: 7.5 });
    await setEvaluationGrade({ evaluationId: "eval-1", studentId: "aluno-1", score: 9 });
    const grades = await fetchEvaluationGradesByEvaluation("eval-1");
    expect(grades).toHaveLength(1);
    expect(grades[0].score).toBe(9);
  });

  it("stores a pending grade as null", async () => {
    await setEvaluationGrade({ evaluationId: "eval-1", studentId: "aluno-1", score: null });
    const grades = await fetchEvaluationGradesByEvaluation("eval-1");
    expect(grades[0].score).toBeNull();
  });
});
