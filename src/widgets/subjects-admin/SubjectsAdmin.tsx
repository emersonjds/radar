"use client";

import { useState } from "react";
import { areaLabels, type Subject } from "@/entities/subject/model";
import { useSubjects, useDeleteSubject } from "@/entities/subject/queries";
import { Button } from "@/shared/ui/button";
import { SubjectFormModal } from "./SubjectFormModal";

export function SubjectsAdmin() {
  const { data: subjects, isLoading } = useSubjects();
  const deleteSubject = useDeleteSubject();
  // undefined = modal closed; null = creating; Subject = editing.
  const [editing, setEditing] = useState<Subject | null | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  async function remover(subject: Subject) {
    setErro(null);
    try {
      await deleteSubject.mutateAsync(subject.id);
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível remover.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Matérias</h1>
        <Button size="sm" onClick={() => setEditing(null)}>
          Adicionar matéria
        </Button>
      </header>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      ) : (
        <ul className="flex flex-col gap-2">
          {(subjects ?? []).map((subject) => (
            <li
              key={subject.id}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-foreground">{subject.name}</p>
                <p className="text-xs text-muted-foreground">{areaLabels[subject.area]}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(subject)}>
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => remover(subject)}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SubjectFormModal subject={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}
