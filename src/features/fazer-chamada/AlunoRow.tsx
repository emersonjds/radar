import type { Aluno } from "@/entities/aluno/model";
import type { StatusPresenca } from "@/entities/presenca/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { cx } from "@/shared/ui/cx";
import styles from "./AlunoRow.module.css";

export const OPCOES_STATUS: Array<{ value: StatusPresenca; label: string }> = [
  { value: "presente", label: "Presente" },
  { value: "ausente", label: "Ausente" },
  { value: "atrasado", label: "Atrasado" },
  { value: "justificado", label: "Justificado" },
];

export interface AlunoRowProps {
  aluno: Aluno;
  status: StatusPresenca | undefined;
  onSelecionarStatus: (status: StatusPresenca) => void;
}

export function AlunoRow({ aluno, status, onSelecionarStatus }: AlunoRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <Avatar nome={aluno.nome} />
        <div className={styles.identidade}>
          <span className={styles.nome}>{aluno.nome}</span>
          <span className={styles.matricula}>Matrícula {aluno.matricula}</span>
        </div>
      </div>

      <div className={styles.segmentado} role="group" aria-label={`Status de presença de ${aluno.nome}`}>
        {OPCOES_STATUS.map((opcao) => (
          <button
            key={opcao.value}
            type="button"
            aria-pressed={status === opcao.value}
            className={cx(styles.opcao, status === opcao.value && cx(styles.opcaoAtiva, styles[opcao.value]))}
            onClick={() => onSelecionarStatus(opcao.value)}
          >
            {opcao.label}
          </button>
        ))}
      </div>
    </div>
  );
}
