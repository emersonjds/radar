"use client";

import { useState } from "react";
import {
  useEnrollmentsByGroup,
  useEnrollStudent,
  useUnenrollStudent,
} from "@/entities/enrollment/queries";
import { useStudents } from "@/entities/student/queries";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

interface Props {
  groupId: string;
}

export function EnrollmentPanel({ groupId }: Props) {
  const { data: enrollments, isLoading } = useEnrollmentsByGroup(groupId);
  const { data: allStudents } = useStudents();
  const enrollStudent = useEnrollStudent();
  const unenrollStudent = useUnenrollStudent();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const activeEnrollments = (enrollments ?? []).filter((enrollment) => enrollment.active);
  const enrolledIds = new Set(activeEnrollments.map((enrollment) => enrollment.studentId));
  const availableStudents = (allStudents ?? []).filter(
    (student) => student.active && !enrolledIds.has(student.id),
  );

  const studentMap = new Map((allStudents ?? []).map((student) => [student.id, student]));

  async function adicionar() {
    if (!selectedStudentId) return;
    setErro(null);
    try {
      await enrollStudent.mutateAsync({ groupId, studentId: selectedStudentId });
      setSelectedStudentId("");
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível matricular.");
    }
  }

  async function remover(studentId: string) {
    setErro(null);
    try {
      await unenrollStudent.mutateAsync({ groupId, studentId });
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível remover.");
    }
  }

  if (isLoading) {
    return <div className="mt-3 h-16 animate-pulse rounded-lg bg-gray-50" />;
  }

  return (
    <section className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Alunos matriculados</h3>

      {erro && (
        <p role="alert" className="mb-3 text-sm text-error-600">
          {erro}
        </p>
      )}

      {activeEnrollments.length === 0 ? (
        <p className="mb-3 text-sm text-gray-500">Nenhum aluno matriculado.</p>
      ) : (
        <ul className="mb-3 flex flex-col gap-1">
          {activeEnrollments.map((enrollment) => {
            const student = studentMap.get(enrollment.studentId);
            return (
              <li
                key={enrollment.id}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm"
              >
                <span className="text-gray-800">{student?.name ?? "—"}</span>
                <Button size="sm" variant="outline" onClick={() => remover(enrollment.studentId)}>
                  Remover
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {availableStudents.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="mb-1.5" htmlFor={`select-${groupId}`}>
              Adicionar aluno
            </Label>
            <select
              id={`select-${groupId}`}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden"
            >
              <option value="">Selecione um aluno</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            onClick={adicionar}
            disabled={!selectedStudentId || enrollStudent.isPending}
          >
            Matricular
          </Button>
        </div>
      )}
    </section>
  );
}
