"use client";

import { useState } from "react";
import { useSession } from "@/features/session/use-session";
import { useAssignmentsByTeacher } from "@/entities/assignment/queries";
import { useGroups } from "@/entities/group/queries";
import { useSubjects } from "@/entities/subject/queries";
import { EvaluationsPanel } from "./EvaluationsPanel";

export function GradesTeacher() {
  const { profileId } = useSession();
  const { data: assignments, isLoading } = useAssignmentsByTeacher(profileId ?? "");
  const { data: groups } = useGroups();
  const { data: subjects } = useSubjects();
  const [selected, setSelected] = useState<string | null>(null);

  function groupName(id: string) {
    return (groups ?? []).find((g) => g.id === id)?.name ?? id;
  }
  function subjectName(id: string) {
    return (subjects ?? []).find((s) => s.id === id)?.name ?? id;
  }

  const current = (assignments ?? []).find((a) => a.id === selected);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-gray-800">Notas</h1>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ) : (assignments ?? []).length === 0 ? (
        <p className="text-sm text-gray-500">Você não leciona nenhuma matéria ainda.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(assignments ?? []).map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              onClick={() => setSelected(assignment.id)}
              className={`rounded-xl border px-4 py-2 text-sm ${
                selected === assignment.id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {subjectName(assignment.subjectId)} — {groupName(assignment.groupId)}
            </button>
          ))}
        </div>
      )}

      {current && <EvaluationsPanel groupId={current.groupId} subjectId={current.subjectId} />}
    </div>
  );
}
