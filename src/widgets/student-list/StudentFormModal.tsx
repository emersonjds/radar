"use client";

import { useState, type FormEvent } from "react";
import type { Group } from "@/entities/group/model";
import type { Student } from "@/entities/student/model";
import { useCreateStudent, useUpdateStudent } from "@/entities/student/queries";
import { Modal } from "@tailadmin/components/ui/modal";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";

const controlClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export interface StudentFormModalProps {
  student: Student | null | undefined;
  groups: Group[];
  onClose: () => void;
}

export function StudentFormModal({ student, groups, onClose }: StudentFormModalProps) {
  return (
    <Modal isOpen={student !== undefined} onClose={onClose} className="m-4 max-w-lg p-6">
      {student !== undefined && (
        <StudentFormBody
          key={student?.id ?? "novo"}
          student={student}
          groups={groups}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

interface StudentFormBodyProps {
  student: Student | null;
  groups: Group[];
  onClose: () => void;
}

function StudentFormBody({ student, groups, onClose }: StudentFormBodyProps) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [name, setName] = useState(student?.name ?? "");
  const [groupId, setGroupId] = useState(student?.groupId ?? groups[0]?.id ?? "");
  const [active, setActive] = useState(student?.active ?? true);
  const [erro, setErro] = useState<string | null>(null);

  const salvando = createStudent.isPending || updateStudent.isPending;

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setErro(null);
    try {
      if (student) {
        await updateStudent.mutateAsync({ id: student.id, patch: { name: name.trim(), groupId, active } });
      } else {
        await createStudent.mutateAsync({ name, groupId });
      }
      onClose();
    } catch {
      setErro("Não foi possível salvar o aluno.");
    }
  }

  return (
    <form onSubmit={salvar}>
      <h4 className="mb-6 text-lg font-semibold text-gray-800">
        {student ? "Editar aluno" : "Adicionar aluno"}
      </h4>

      <div className="mb-5">
        <Label htmlFor="aluno-nome">Nome</Label>
        <input
          id="aluno-nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
          className={controlClasses}
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="aluno-turma">Turma</Label>
        <select
          id="aluno-turma"
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          required
          className={controlClasses}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {student && (
        <label className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-500"
          />
          Ativo
        </label>
      )}

      {erro && (
        <p role="alert" className="mb-5 text-sm text-error-600">
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Button>
      </div>
    </form>
  );
}
