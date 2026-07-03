import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { gradeSchema, type Grade } from "./model";

export async function fetchGrades(): Promise<Grade[]> {
  const rows = await readCollection("grades");
  return rows.map((row) => gradeSchema.parse(row));
}

export async function fetchGradesByAssessment(
  assessmentId: string,
): Promise<Grade[]> {
  const grades = await fetchGrades();
  return grades.filter((grade) => grade.assessmentId === assessmentId);
}

export async function fetchGradesByStudent(studentId: string): Promise<Grade[]> {
  const grades = await fetchGrades();
  return grades.filter((grade) => grade.studentId === studentId);
}

/**
 * Set a student's grade in an assessment. Unique per (assessment, student) — an
 * existing record is updated in place (server constraint later).
 */
export async function setGrade(input: {
  assessmentId: string;
  studentId: string;
  value: number | null;
}): Promise<Grade> {
  const grade = gradeSchema.parse({
    id: `grade-${input.assessmentId}-${input.studentId}`,
    ...input,
  });
  await mutateCollection<Grade>("grades", (rows) => {
    const index = rows.findIndex((row) => row.id === grade.id);
    if (index === -1) return [...rows, grade];
    const next = [...rows];
    next[index] = grade;
    return next;
  });
  return grade;
}
