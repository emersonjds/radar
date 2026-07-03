import type { Aluno } from "@/entities/aluno/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { cx } from "@/shared/ui/cx";
import styles from "./AvaliacoesView.module.css";

export interface NotaRowProps {
  aluno: Aluno;
  valor: string;
  erro?: string;
  onAlterar: (valor: string) => void;
}

export function NotaRow({ aluno, valor, erro, onAlterar }: NotaRowProps) {
  const inputId = `nota-${aluno.id}`;
  return (
    <div className={styles.notaRow}>
      <div className={styles.info}>
        <Avatar nome={aluno.nome} />
        <div className={styles.identidade}>
          <span className={styles.nome}>{aluno.nome}</span>
          <span className={styles.matricula}>Matrícula {aluno.matricula}</span>
        </div>
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
          value={valor}
          aria-label={`Nota de ${aluno.nome}`}
          aria-invalid={Boolean(erro)}
          onChange={(event) => onAlterar(event.target.value)}
        />
        {erro && <span className={styles.erroCampo}>{erro}</span>}
      </div>
    </div>
  );
}
