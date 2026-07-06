"use client";

import { useState, type FormEvent } from "react";
import type { Student } from "@/entities/student/model";
import { useCreateStudent, useUpdateStudent } from "@/entities/student/queries";
import { Modal } from "@tailadmin/components/ui/modal";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";
import Input from "@tailadmin/components/form/input/InputField";
import Checkbox from "@tailadmin/components/form/input/Checkbox";

export interface StudentFormModalProps {
  student: Student | null | undefined;
  onClose: () => void;
}

export function StudentFormModal({ student, onClose }: StudentFormModalProps) {
  return (
    <Modal isOpen={student !== undefined} onClose={onClose} className="m-4 max-w-lg p-6">
      {student !== undefined && <StudentFormBody key={student?.id ?? "novo"} student={student} onClose={onClose} />}
    </Modal>
  );
}

interface StudentFormBodyProps {
  student: Student | null;
  onClose: () => void;
}

function StudentFormBody({ student, onClose }: StudentFormBodyProps) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [name, setName] = useState(student?.name ?? "");
  const [birthDate, setBirthDate] = useState(student?.birthDate ?? "");
  const [guardianName, setGuardianName] = useState(student?.guardianName ?? "");
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone ?? "");
  const [active, setActive] = useState(student?.active ?? true);
  const [erro, setErro] = useState<string | null>(null);

  const salvando = createStudent.isPending || updateStudent.isPending;

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;
    setErro(null);
    try {
      if (student) {
        await updateStudent.mutateAsync({
          id: student.id,
          patch: { name, birthDate, guardianName, guardianPhone, active },
        });
      } else {
        await createStudent.mutateAsync({ name, birthDate, guardianName, guardianPhone });
      }
      onClose();
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível salvar o aluno.");
    }
  }

  return (
    <form onSubmit={salvar}>
      <h4 className="mb-6 text-lg font-semibold text-gray-800">{student ? "Editar aluno" : "Adicionar aluno"}</h4>

      <div className="mb-5">
        <Label htmlFor="aluno-nome">Nome</Label>
        <Input id="aluno-nome" value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
      </div>

      <div className="mb-5">
        <Label htmlFor="aluno-nascimento">Data de nascimento</Label>
        <Input
          id="aluno-nascimento"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          required
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="aluno-responsavel">Nome do responsável</Label>
        <Input
          id="aluno-responsavel"
          value={guardianName}
          onChange={(event) => setGuardianName(event.target.value)}
          required
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="aluno-telefone">Telefone do responsável</Label>
        <Input
          id="aluno-telefone"
          type="tel"
          inputMode="tel"
          placeholder="(11) 91234-5678"
          value={guardianPhone}
          onChange={(event) => setGuardianPhone(event.target.value)}
          required
        />
      </div>

      {student && (
        <div className="mb-5 flex items-center gap-2">
          <Checkbox id="aluno-ativo" checked={active} onChange={setActive} label="Ativo" />
        </div>
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
