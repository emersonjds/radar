import type { Student } from "@/entities/student/model";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { cx } from "@/shared/ui/cx";
import styles from "./StudentRow.module.css";

// `short` follows the Brazilian class-register convention: P/A/F/J.
export const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string; short: string }> = [
  { value: "present", label: "Presente", short: "P" },
  { value: "late", label: "Atrasado", short: "A" },
  { value: "absent", label: "Ausente", short: "F" },
  { value: "excused", label: "Justificado", short: "J" },
];

export interface StudentRowProps {
  aluno: Student;
  status: AttendanceStatus | undefined;
  onSelectStatus: (status: AttendanceStatus) => void;
}

export function StudentRow({ aluno, status, onSelectStatus }: StudentRowProps) {
  return (
    <div className={cx(styles.row, status === "absent" && styles.rowMuted)}>
      <div className={styles.identidade}>
        <span className={styles.name}>{aluno.name}</span>
        <span className={styles.enrollment}>Matrícula {aluno.enrollment}</span>
      </div>

      <div className={styles.opcoes} role="group" aria-label={`Status de presença de ${aluno.name}`}>
        {STATUS_OPTIONS.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={status === opcao.value}
            aria-label={opcao.label}
            title={opcao.label}
            className={cx(styles.opcao, status === opcao.value && cx(styles.opcaoAtiva, styles[opcao.value]))}
            onClick={() => onSelectStatus(opcao.value)}
          >
            {opcao.short}
          </button>
        ))}
      </div>
    </div>
  );
}
