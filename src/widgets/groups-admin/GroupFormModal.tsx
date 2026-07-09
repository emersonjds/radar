"use client";

import { useState, type FormEvent } from "react";
import { shiftSchema, shiftLabels, type Group, type Shift } from "@/entities/group/model";
import { useCreateGroup, useUpdateGroup } from "@/entities/group/queries";
import { useProfiles } from "@/entities/profile/queries";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

const controlClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export interface GroupFormModalProps {
  group: Group | null | undefined;
  onClose: () => void;
}

export function GroupFormModal({ group, onClose }: GroupFormModalProps) {
  return (
    <Dialog
      open={group !== undefined}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        {group !== undefined && (
          <GroupFormBody key={group?.id ?? "new"} group={group} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GroupFormBody({ group, onClose }: { group: Group | null; onClose: () => void }) {
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const { data: profiles } = useProfiles();
  const teachers = (profiles ?? []).filter((profile) => profile.role === "teacher");

  const [name, setName] = useState(group?.name ?? "");
  const [shift, setShift] = useState<Shift>(group?.shift ?? "afternoon");
  const [teacherId, setTeacherId] = useState(group?.teacherId ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const saving = createGroup.isPending || updateGroup.isPending;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setErro(null);
    const regente = teacherId || teachers[0]?.id || "";
    try {
      if (group) {
        await updateGroup.mutateAsync({
          id: group.id,
          patch: { name: name.trim(), shift, teacherId: regente },
        });
      } else {
        await createGroup.mutateAsync({
          name,
          shift,
          teacherId: regente,
        });
      }
      onClose();
    } catch {
      setErro("Não foi possível salvar a aula.");
    }
  }

  return (
    <form onSubmit={save}>
      <DialogTitle className="mb-6 text-gray-800">
        {group ? "Editar aula" : "Adicionar aula"}
      </DialogTitle>

      <div className="mb-5">
        <Label className="mb-1.5" htmlFor="turma-nome">
          Nome
        </Label>
        <input
          id="turma-nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          className={controlClasses}
        />
      </div>

      <div className="mb-5">
        <Label className="mb-1.5" htmlFor="turma-turno">
          Turno
        </Label>
        <select
          id="turma-turno"
          value={shift}
          onChange={(e) => setShift(e.target.value as Shift)}
          className={controlClasses}
        >
          {shiftSchema.options.map((value) => (
            <option key={value} value={value}>
              {shiftLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <Label className="mb-1.5" htmlFor="turma-regente">
          Professor regente
        </Label>
        <select
          id="turma-regente"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
          className={controlClasses}
        >
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p role="alert" className="mb-5 text-sm text-error-600">
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
      </div>
    </form>
  );
}
