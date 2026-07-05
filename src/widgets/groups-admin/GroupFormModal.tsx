"use client";

import { useState, type FormEvent } from "react";
import { shiftSchema, shiftLabels, type Group, type Shift } from "@/entities/group/model";
import { useCreateGroup, useUpdateGroup } from "@/entities/group/queries";
import { useProfiles } from "@/entities/profile/queries";
import { Modal } from "@tailadmin/components/ui/modal";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";

const controlClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export interface GroupFormModalProps {
  group: Group | null | undefined;
  onClose: () => void;
}

export function GroupFormModal({ group, onClose }: GroupFormModalProps) {
  return (
    <Modal isOpen={group !== undefined} onClose={onClose} className="m-4 max-w-lg p-6">
      {group !== undefined && (
        <GroupFormBody key={group?.id ?? "new"} group={group} onClose={onClose} />
      )}
    </Modal>
  );
}

function GroupFormBody({ group, onClose }: { group: Group | null; onClose: () => void }) {
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const { data: profiles } = useProfiles();
  const teachers = (profiles ?? []).filter((profile) => profile.role === "teacher");

  const [name, setName] = useState(group?.name ?? "");
  const [gradeLevel, setGradeLevel] = useState(group?.gradeLevel ?? "");
  const [shift, setShift] = useState<Shift>(group?.shift ?? "manhã");
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
          patch: { name: name.trim(), gradeLevel: gradeLevel.trim(), shift, teacherId: regente },
        });
      } else {
        await createGroup.mutateAsync({
          name,
          gradeLevel,
          shift,
          teacherId: regente,
        });
      }
      onClose();
    } catch {
      setErro("Não foi possível salvar a turma.");
    }
  }

  return (
    <form onSubmit={save}>
      <h4 className="mb-6 text-lg font-semibold text-gray-800">
        {group ? "Editar turma" : "Adicionar turma"}
      </h4>

      <div className="mb-5">
        <Label htmlFor="turma-nome">Nome</Label>
        <input id="turma-nome" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className={controlClasses} />
      </div>

      <div className="mb-5">
        <Label htmlFor="turma-serie">Série</Label>
        <input id="turma-serie" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} required className={controlClasses} />
      </div>

      <div className="mb-5">
        <Label htmlFor="turma-turno">Turno</Label>
        <select id="turma-turno" value={shift} onChange={(e) => setShift(e.target.value as Shift)} className={controlClasses}>
          {shiftSchema.options.map((value) => (
            <option key={value} value={value}>
              {shiftLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <Label htmlFor="turma-regente">Professor regente</Label>
        <select id="turma-regente" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required className={controlClasses}>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p role="alert" className="mb-5 text-sm text-error-600">{erro}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
      </div>
    </form>
  );
}
