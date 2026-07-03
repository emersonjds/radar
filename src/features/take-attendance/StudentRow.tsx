import type { Student } from "@/entities/student/model";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Icon, type IconName } from "@/shared/ui/Icon/Icon";
import { cx } from "@/shared/ui/cx";
import styles from "./StudentRow.module.css";

export const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string; icon: IconName }> = [
  { value: "present", label: "Presente", icon: "check-circle" },
  { value: "late", label: "Atrasado", icon: "clock" },
  { value: "absent", label: "Ausente", icon: "x-circle" },
  { value: "excused", label: "Justificado", icon: "grade" },
];

export interface StudentRowProps {
  aluno: Student;
  status: AttendanceStatus | undefined;
  onSelectStatus: (status: AttendanceStatus) => void;
}

export function StudentRow({ aluno, status, onSelectStatus }: StudentRowProps) {
  return (
    <div className={cx(styles.card, status === "absent" && styles.cardMuted)}>
      <div className={styles.info}>
        <Avatar name={aluno.name} />
        <div className={styles.identidade}>
          <span className={styles.name}>{aluno.name}</span>
          <span className={styles.enrollment}>Matrícula {aluno.enrollment}</span>
        </div>
      </div>

      <div className={styles.opcoes} role="group" aria-label={`Status de presença de ${aluno.name}`}>
        {STATUS_OPTIONS.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={status === opcao.value}
            className={cx(styles.opcao, status === opcao.value && cx(styles.opcaoAtiva, styles[opcao.value]))}
            onClick={() => onSelectStatus(opcao.value)}
          >
            <Icon name={opcao.icon} size={16} />
            <span>{opcao.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
