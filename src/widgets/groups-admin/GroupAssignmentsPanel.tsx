"use client";

import { useState } from "react";
import { useSubjects } from "@/entities/subject/queries";
import { useProfiles } from "@/entities/profile/queries";
import {
  useAssignmentsByGroup,
  useCreateAssignment,
  useUpdateAssignmentTeacher,
  useDeleteAssignment,
} from "@/entities/assignment/queries";
import { Button } from "@/shared/ui/button";

const controlClasses =
  "h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden";

export function GroupAssignmentsPanel({ groupId }: { groupId: string }) {
  const { data: assignments } = useAssignmentsByGroup(groupId);
  const { data: subjects } = useSubjects();
  const { data: profiles } = useProfiles();
  const createAssignment = useCreateAssignment();
  const updateTeacher = useUpdateAssignmentTeacher();
  const deleteAssignment = useDeleteAssignment();

  const teachers = (profiles ?? []).filter((profile) => profile.role === "teacher");
  const usedSubjectIds = new Set((assignments ?? []).map((a) => a.subjectId));
  const availableSubjects = (subjects ?? []).filter((s) => !usedSubjectIds.has(s.id));

  const [newSubjectId, setNewSubjectId] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function subjectName(id: string) {
    return (subjects ?? []).find((s) => s.id === id)?.name ?? id;
  }

  async function adicionar() {
    setErro(null);
    const subjectId = newSubjectId || availableSubjects[0]?.id;
    const teacherId = newTeacherId || teachers[0]?.id;
    if (!subjectId || !teacherId) return;
    try {
      await createAssignment.mutateAsync({ groupId, subjectId, teacherId });
      setNewSubjectId("");
      setNewTeacherId("");
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível adicionar.");
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-4">
      <h5 className="mb-3 text-sm font-semibold text-gray-700">Matérias desta aula</h5>

      <ul className="mb-4 flex flex-col gap-2">
        {(assignments ?? []).map((assignment) => (
          <li key={assignment.id} className="flex flex-wrap items-center gap-2">
            <span className="min-w-32 text-sm text-gray-800">
              {subjectName(assignment.subjectId)}
            </span>
            <select
              aria-label={`Professor de ${subjectName(assignment.subjectId)}`}
              value={assignment.teacherId}
              onChange={(e) =>
                updateTeacher.mutate({ id: assignment.id, teacherId: e.target.value })
              }
              className={controlClasses}
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteAssignment.mutate(assignment.id)}
            >
              Remover
            </Button>
          </li>
        ))}
        {(assignments ?? []).length === 0 && (
          <li className="text-sm text-gray-500">Nenhuma matéria atribuída ainda.</li>
        )}
      </ul>

      {erro && (
        <p role="alert" className="mb-2 text-sm text-error-600">
          {erro}
        </p>
      )}

      {availableSubjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Matéria a adicionar"
            value={newSubjectId}
            onChange={(e) => setNewSubjectId(e.target.value)}
            className={controlClasses}
          >
            {availableSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Professor da matéria"
            value={newTeacherId}
            onChange={(e) => setNewTeacherId(e.target.value)}
            className={controlClasses}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={adicionar}>
            Adicionar matéria à aula
          </Button>
        </div>
      )}
    </div>
  );
}
