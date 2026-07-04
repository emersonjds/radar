import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { fetchGrades, fetchGradesByStudent } from "./api";

describe("grade api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("seed dá uma nota por (aluno, matéria) — única", async () => {
    const grades = await fetchGrades();
    const chaves = grades.map((grade) => `${grade.studentId}:${grade.subjectId}`);
    expect(new Set(chaves).size).toBe(chaves.length);
    // 18 alunos × 8 matérias
    expect(grades).toHaveLength(18 * 8);
  });

  it("notas por aluno cobrem todas as 8 matérias e ficam em [0, 10]", async () => {
    const doAluno = await fetchGradesByStudent("aluno-1");
    expect(doAluno).toHaveLength(8);
    for (const grade of doAluno) {
      expect(grade.score).toBeGreaterThanOrEqual(0);
      expect(grade.score).toBeLessThanOrEqual(10);
    }
  });
});
