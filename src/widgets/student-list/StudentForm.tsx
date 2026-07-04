"use client";

import { useState, type FormEvent } from "react";
import type { Group } from "@/entities/group/model";
import type { Student } from "@/entities/student/model";
import { useCreateStudent, useUpdateStudent } from "@/entities/student/queries";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./StudentForm.module.css";

export interface StudentFormProps {
  student: Student | null;
  groups: Group[];
  onClose: () => void;
}

export function StudentForm({ student, groups, onClose }: StudentFormProps) {
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
    <form className={styles.form} onSubmit={salvar}>
      <h2 className={styles.titulo}>{student ? "Editar aluno" : "Adicionar aluno"}</h2>

      <div className={styles.campos}>
        <div className={styles.campo}>
          <label htmlFor="aluno-nome">Nome</label>
          <input
            id="aluno-nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
          />
        </div>
        <div className={styles.campo}>
          <label htmlFor="aluno-turma">Turma</label>
          <select
            id="aluno-turma"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            required
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        {student && (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            <span>Ativo</span>
          </label>
        )}
      </div>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <div className={styles.acoes}>
        <Button type="button" variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
