import { readCollection } from "@/shared/lib/storage/db";
import { evaluationSchema, type Evaluation } from "@/entities/evaluation/model";
import { evaluationGradeSchema, type EvaluationGrade } from "@/entities/evaluation-grade/model";
import type { Grade } from "./model";
import { deriveSubjectGrades } from "./derive";

async function readEvaluations(): Promise<Evaluation[]> {
  const rows = await readCollection("evaluations");
  return rows.map((row) => evaluationSchema.parse(row));
}

async function readEvaluationGrades(): Promise<EvaluationGrade[]> {
  const rows = await readCollection("evaluationGrades");
  return rows.map((row) => evaluationGradeSchema.parse(row));
}

/** Per-subject aggregate, derived from evaluations + evaluation grades. */
export async function fetchGrades(): Promise<Grade[]> {
  const [evaluations, evaluationGrades] = await Promise.all([readEvaluations(), readEvaluationGrades()]);
  return deriveSubjectGrades(evaluations, evaluationGrades);
}

export async function fetchGradesByStudent(studentId: string): Promise<Grade[]> {
  const [evaluations, evaluationGrades] = await Promise.all([readEvaluations(), readEvaluationGrades()]);
  return deriveSubjectGrades(evaluations, evaluationGrades, [studentId]);
}
