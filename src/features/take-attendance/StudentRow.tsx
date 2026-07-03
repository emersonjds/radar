import type { Student } from "@/entities/student/model";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { cx } from "@/shared/ui/cx";
import styles from "./StudentRow.module.css";

export const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "present", label: "Presente" },
  { value: "absent", label: "Ausente" },
  { value: "late", label: "Atrasado" },
  { value: "excused", label: "Justificado" },
];

export interface StudentRowProps {
  aluno: Student;
  status: AttendanceStatus | undefined;
  onSelectStatus: (status: AttendanceStatus) => void;
}

export function StudentRow({ aluno, status, onSelectStatus }: StudentRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <Avatar name={aluno.name} />
        <div className={styles.identidade}>
          <span className={styles.name}>{aluno.name}</span>
          <span className={styles.enrollment}>Matrícula {aluno.enrollment}</span>
        </div>
      </div>

      <div className={styles.segmentado} role="group" aria-label={`Status de presença de ${aluno.name}`}>
        {STATUS_OPTIONS.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={status === opcao.value}
            className={cx(styles.opcao, status === opcao.value && cx(styles.opcaoAtiva, styles[opcao.value]))}
            onClick={() => onSelectStatus(opcao.value)}
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
