import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { fetchGrades, fetchGradesByStudent } from "./api";

describe("grade api (derived)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns one derived grade per (student, subject) with scores in [0, 10]", async () => {
    const grades = await fetchGrades();
    const keys = grades.map((grade) => `${grade.studentId}:${grade.subjectId}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const grade of grades) {
      expect(grade.score).toBeGreaterThanOrEqual(0);
      expect(grade.score).toBeLessThanOrEqual(10);
    }
    // Seed: 3 turmas × 6 alunos, cada turma com 3, 2 e 2 lecionamentos.
    expect(grades).toHaveLength(6 * 3 + 6 * 2 + 6 * 2);
  });

  it("filters derived grades by student", async () => {
    const grades = await fetchGradesByStudent("aluno-1");
    // Aluno-1 pertence à turma-mat-b, que tem 3 lecionamentos no seed.
    expect(grades).toHaveLength(3);
    for (const grade of grades) {
      expect(grade.studentId).toBe("aluno-1");
      expect(grade.score).toBeGreaterThanOrEqual(0);
      expect(grade.score).toBeLessThanOrEqual(10);
    }
  });
});
