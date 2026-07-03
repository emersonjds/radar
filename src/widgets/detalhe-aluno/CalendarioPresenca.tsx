import { useState } from "react";
import type { StatusPresenca } from "@/entities/presenca/model";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { Icon } from "@/shared/ui/Icon/Icon";
import { formatarDataExtenso } from "@/shared/lib/format";
import { cx } from "@/shared/ui/cx";
import styles from "./CalendarioPresenca.module.css";

export interface CalendarioPresencaProps {
  /** Month to render, "YYYY-MM". */
  mes: string;
  /** Session date (ISO) → status, for this student. */
  statusPorData: Map<string, StatusPresenca>;
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const LABEL_STATUS: Record<StatusPresenca, string> = {
  presente: "Presente",
  atrasado: "Atrasado",
  ausente: "Ausente",
  justificado: "Justificado",
};

/** Shifts a "YYYY-MM" string by `delta` months, carrying over the year. */
function deslocarMes(mes: string, delta: number): string {
  const [ano, mesNumero] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mesNumero - 1 + delta, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function toneClass(status: StatusPresenca | undefined): string {
  if (!status) return styles.semAula;
  // ponytail: spec's palette covers presente/atrasado/ausente/sem aula; justificado
  // reuses the tertiary tone (it's not a plain absence) since the mockup has no swatch for it.
  if (status === "justificado") return styles.justificado;
  return styles[status];
}

export function CalendarioPresenca({ mes, statusPorData }: CalendarioPresencaProps) {
  const [mesVisivel, setMesVisivel] = useState(mes);
  const [ano, mesNumero] = mesVisivel.split("-").map(Number);
  const mesIndex = mesNumero - 1;
  const diasNoMes = new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
  // getUTCDay: 0=domingo..6=sábado → desloca para semana começando na segunda.
  const primeiraColuna = (new Date(Date.UTC(ano, mesIndex, 1)).getUTCDay() + 6) % 7;
  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mesIndex, 1)));

  const celulasVazias = Array.from({ length: primeiraColuna });
  const dias = Array.from({ length: diasNoMes }, (_, indice) => indice + 1);

  return (
    <div className={styles.calendario}>
      <div className={styles.cabecalho}>
        <h3 className={styles.titulo}>Resumo de presença</h3>
        <div className={styles.navegacao}>
          <span className={styles.mesAtual}>
            {tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}
          </span>
          <IconButton
            label="Mês anterior"
            size="sm"
            onClick={() => setMesVisivel((atual) => deslocarMes(atual, -1))}
          >
            <Icon name="chevron-left" size={16} />
          </IconButton>
          <IconButton
            label="Próximo mês"
            size="sm"
            onClick={() => setMesVisivel((atual) => deslocarMes(atual, 1))}
          >
            <Icon name="chevron-right" size={16} />
          </IconButton>
        </div>
      </div>

      <div className={styles.grade}>
        {DIAS_SEMANA.map((dia) => (
          <span key={dia} className={styles.diaSemana}>
            {dia}
          </span>
        ))}
        {celulasVazias.map((_, indice) => (
          <span key={`vazio-${indice}`} aria-hidden="true" />
        ))}
        {dias.map((dia) => {
          const dataIso = `${ano}-${String(mesNumero).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const status = statusPorData.get(dataIso);
          const rotulo = `${formatarDataExtenso(dataIso)} — ${status ? LABEL_STATUS[status] : "Sem aula"}`;
          return (
            <span
              key={dataIso}
              className={cx(styles.dia, toneClass(status))}
              title={rotulo}
              aria-label={rotulo}
            >
              {dia}
            </span>
          );
        })}
      </div>

      <ul className={styles.legenda}>
        <li>
          <span className={cx(styles.amostra, styles.presente)} aria-hidden="true" />
          Presente
        </li>
        <li>
          <span className={cx(styles.amostra, styles.atrasado)} aria-hidden="true" />
          Atrasado
        </li>
        <li>
          <span className={cx(styles.amostra, styles.ausente)} aria-hidden="true" />
          Ausente
        </li>
      </ul>
    </div>
  );
}
