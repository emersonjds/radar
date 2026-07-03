import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { setGrade, fetchGradesByAssessment } from "./api";

describe("grade api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("upserts by (assessment, student) instead of duplicating", async () => {
    const base = { assessmentId: "assessment-x", studentId: "student-1" };
    await setGrade({ ...base, value: 6.5 });
    await setGrade({ ...base, value: 8 });
    const grades = await fetchGradesByAssessment("assessment-x");
    const doAluno = grades.filter((grade) => grade.studentId === "student-1");
    expect(doAluno).toHaveLength(1);
    expect(doAluno[0].value).toBe(8);
  });

  it("rejects a valor with more than one decimal place", async () => {
    await expect(
      setGrade({ assessmentId: "assessment-x", studentId: "student-1", value: 10.05 }),
    ).rejects.toThrow();
  });

  it("accepts null as pending", async () => {
    const grade = await setGrade({
      assessmentId: "assessment-x",
      studentId: "student-2",
      value: null,
    });
    expect(grade.value).toBeNull();
  });
});
