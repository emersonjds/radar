"use client";

import { useState } from "react";
import { shiftLabels, type Group } from "@/entities/group/model";
import { useGroups, useDeleteGroup } from "@/entities/group/queries";
import { useProfiles } from "@/entities/profile/queries";
import Button from "@tailadmin/components/ui/button/Button";
import { GroupFormModal } from "./GroupFormModal";
import { GroupAssignmentsPanel } from "./GroupAssignmentsPanel";
import { EnrollmentPanel } from "./EnrollmentPanel";

export function GroupsAdmin() {
  const { data: groups, isLoading } = useGroups();
  const { data: profiles } = useProfiles();
  const deleteGroup = useDeleteGroup();
  const [editing, setEditing] = useState<Group | null | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function regenteName(teacherId: string) {
    return (profiles ?? []).find((p) => p.id === teacherId)?.name ?? "—";
  }

  async function remover(group: Group) {
    setErro(null);
    try {
      await deleteGroup.mutateAsync(group.id);
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível remover.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Turmas</h1>
        <Button size="sm" onClick={() => setEditing(null)}>
          Adicionar turma
        </Button>
      </header>

      {erro && (
        <p role="alert" className="text-sm text-error-600">
          {erro}
        </p>
      )}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <ul className="flex flex-col gap-2">
          {(groups ?? []).map((group) => (
            <li key={group.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {shiftLabels[group.shift]} · Regente: {regenteName(group.teacherId)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                  >
                    {expandedId === group.id ? "Fechar" : "Ver detalhes"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(group)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remover(group)}>
                    Excluir
                  </Button>
                </div>
              </div>
              {expandedId === group.id && (
                <>
                  <EnrollmentPanel groupId={group.id} />
                  <GroupAssignmentsPanel groupId={group.id} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <GroupFormModal group={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}
