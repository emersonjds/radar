import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { evaluationGradeSchema, type EvaluationGrade } from "./model";

export async function fetchEvaluationGrades(): Promise<EvaluationGrade[]> {
  const rows = await readCollection("evaluationGrades");
  return rows.map((row) => evaluationGradeSchema.parse(row));
}

export async function fetchEvaluationGradesByEvaluation(
  evaluationId: string,
): Promise<EvaluationGrade[]> {
  const grades = await fetchEvaluationGrades();
  return grades.filter((grade) => grade.evaluationId === evaluationId);
}

export interface SetEvaluationGradeInput {
  evaluationId: string;
  studentId: string;
  score: number | null;
}

/** Upsert a single student's grade on an evaluation (unique per evaluation+student). */
export async function setEvaluationGrade(input: SetEvaluationGradeInput): Promise<void> {
  await mutateCollection<EvaluationGrade>("evaluationGrades", (rows) => {
    const existing = rows.find(
      (row) => row.evaluationId === input.evaluationId && row.studentId === input.studentId,
    );
    if (existing) {
      return rows.map((row) =>
        row === existing ? { ...row, score: input.score } : row,
      );
    }
    const created: EvaluationGrade = {
      id: crypto.randomUUID(),
      evaluationId: input.evaluationId,
      studentId: input.studentId,
      score: input.score,
    };
    evaluationGradeSchema.parse(created);
    return [...rows, created];
  });
}
