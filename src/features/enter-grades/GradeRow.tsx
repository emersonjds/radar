import type { Student } from "@/entities/student/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { cx } from "@/shared/ui/cx";
import styles from "./AssessmentsView.module.css";

export interface GradeRowProps {
  aluno: Student;
  value: string;
  erro?: string;
  onChange: (value: string) => void;
}

export function GradeRow({ aluno, value, erro, onChange }: GradeRowProps) {
  const inputId = `nota-${aluno.id}`;
  return (
    <div className={styles.notaRow}>
      <div className={styles.info}>
        <Avatar name={aluno.name} />
        <span className={styles.name}>{aluno.name}</span>
      </div>

      <div className={styles.campoNota}>
        <input
          id={inputId}
          type="number"
          min={0}
          max={10}
          step={0.1}
          inputMode="decimal"
          className={cx(styles.inputNota, erro && styles.inputNotaErro)}
          value={value}
          aria-label={`Grade de ${aluno.name}`}
          aria-invalid={Boolean(erro)}
          onChange={(event) => onChange(event.target.value)}
        />
        {erro && <span className={styles.erroCampo}>{erro}</span>}
      </div>
    </div>
  );
}
