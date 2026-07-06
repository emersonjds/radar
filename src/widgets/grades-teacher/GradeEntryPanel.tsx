"use client";

import { useStudentsByGroup } from "@/entities/student/queries";
import type { Evaluation } from "@/entities/evaluation/model";
import { useEvaluationGradesByEvaluation, useSetEvaluationGrade } from "@/entities/evaluation-grade/queries";

const inputClasses =
  "h-10 w-24 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden";

export function GradeEntryPanel({ evaluation }: { evaluation: Evaluation }) {
  const { data: students } = useStudentsByGroup(evaluation.groupId);
  const { data: grades } = useEvaluationGradesByEvaluation(evaluation.id);
  const setGrade = useSetEvaluationGrade();

  function scoreOf(studentId: string): string {
    const grade = (grades ?? []).find((g) => g.studentId === studentId);
    return grade && grade.score !== null ? String(grade.score) : "";
  }

  function onBlurScore(studentId: string, raw: string) {
    const trimmed = raw.trim();
    const score = trimmed === "" ? null : Number(trimmed);
    if (score !== null && (Number.isNaN(score) || score < 0 || score > 10)) return;
    setGrade.mutate({ evaluationId: evaluation.id, studentId, score });
  }

  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-4">
      <h5 className="mb-3 text-sm font-semibold text-gray-700">Notas — {evaluation.name}</h5>
      <ul className="flex flex-col gap-2">
        {(students ?? []).map((student) => (
          <li key={student.id} className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-800">{student.name}</span>
            <input
              aria-label={`Nota de ${student.name}`}
              type="number"
              min={0}
              max={10}
              step={0.1}
              defaultValue={scoreOf(student.id)}
              key={scoreOf(student.id)}
              placeholder="—"
              onBlur={(e) => onBlurScore(student.id, e.target.value)}
              className={inputClasses}
            />
          </li>
        ))}
        {(students ?? []).length === 0 && <li className="text-sm text-gray-500">Aula sem alunos.</li>}
      </ul>
    </div>
  );
}
