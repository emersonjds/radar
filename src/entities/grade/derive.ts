import type { Evaluation } from "@/entities/evaluation/model";
import type { EvaluationGrade } from "@/entities/evaluation-grade/model";
import type { Grade } from "./model";

const round1 = (value: number): number => Math.round(value * 10) / 10;

/**
 * Aggregate per-evaluation grades into one weighted average per (student, subject).
 * Weight = the evaluation's `weight`. Pending (null) grades are ignored; a subject
 * with no scored evaluations for a student is omitted. Optional `studentIds` limits
 * the output (used by per-student fetches).
 */
export function deriveSubjectGrades(
  evaluations: Evaluation[],
  evaluationGrades: EvaluationGrade[],
  studentIds?: string[],
): Grade[] {
  const evaluationById = new Map(evaluations.map((evaluation) => [evaluation.id, evaluation]));
  const allow = studentIds ? new Set(studentIds) : null;
  const acc = new Map<string, { studentId: string; subjectId: string; sum: number; weight: number }>();

  for (const grade of evaluationGrades) {
    if (grade.score === null) continue;
    if (allow && !allow.has(grade.studentId)) continue;
    const evaluation = evaluationById.get(grade.evaluationId);
    if (!evaluation) continue;
    const key = `${grade.studentId}-${evaluation.subjectId}`;
    const bucket = acc.get(key) ?? {
      studentId: grade.studentId,
      subjectId: evaluation.subjectId,
      sum: 0,
      weight: 0,
    };
    bucket.sum += grade.score * evaluation.weight;
    bucket.weight += evaluation.weight;
    acc.set(key, bucket);
  }

  return [...acc.values()].map(({ studentId, subjectId, sum, weight }) => ({
    id: `derived-${studentId}-${subjectId}`,
    studentId,
    subjectId,
    score: round1(sum / weight),
  }));
}
