import { readCollection } from "@/shared/lib/storage/db";
import { gradeSchema, type Grade } from "./model";

export async function fetchGrades(): Promise<Grade[]> {
  const rows = await readCollection("grades");
  return rows.map((row) => gradeSchema.parse(row));
}

export async function fetchGradesByStudent(studentId: string): Promise<Grade[]> {
  const grades = await fetchGrades();
  return grades.filter((grade) => grade.studentId === studentId);
}
