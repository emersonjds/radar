import { useState } from "react";
import type { StatusPresenca } from "@/entities/presenca/model";
import type { TipoEventoEscolar } from "@/entities/evento-escolar/model";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { Icon } from "@/shared/ui/Icon/Icon";
import { formatarDataExtenso } from "@/shared/lib/format";
import { cx } from "@/shared/ui/cx";
import styles from "./CalendarioPresenca.module.css";

export interface EventoDoDia {
  tipo: TipoEventoEscolar | "prova";
  titulo: string;
}

export interface CalendarioPresencaProps {
  /** Month to render, "YYYY-MM". */
  mes: string;
  /** Session date (ISO) → status, for this student. */
  statusPorData: Map<string, StatusPresenca>;
  /** Date (ISO) → important events (provas, férias, recuperação). */
  eventosPorData?: Map<string, EventoDoDia[]>;
}

// Domingo-primeiro, iniciais como no Google Calendar pt-BR.
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const LABEL_STATUS: Record<StatusPresenca, string> = {
  presente: "Presente",
  atrasado: "Atrasado",
  ausente: "Ausente",
  justificado: "Justificado",
};

const LABEL_EVENTO: Record<EventoDoDia["tipo"], string> = {
  prova: "Prova",
  ferias: "Férias",
  recuperacao: "Recuperação",
  evento: "Evento",
};

/** Shifts a "YYYY-MM" string by `delta` months, carrying over the year. */
function deslocarMes(mes: string, delta: number): string {
  const [ano, mesNumero] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mesNumero - 1 + delta, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function toneClass(status: StatusPresenca | undefined): string {
  if (!status) return styles.semAula;
  // ponytail: justificado reutiliza o tom do atrasado — não é falta simples.
  if (status === "justificado") return styles.justificado;
  return styles[status];
}

export function CalendarioPresenca({ mes, statusPorData, eventosPorData }: CalendarioPresencaProps) {
  const [mesVisivel, setMesVisivel] = useState(mes);
  const [ano, mesNumero] = mesVisivel.split("-").map(Number);
  const mesIndex = mesNumero - 1;
  const diasNoMes = new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
  const primeiraColuna = new Date(Date.UTC(ano, mesIndex, 1)).getUTCDay();
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
          <IconButton
            label="Mês anterior"
            size="sm"
            onClick={() => setMesVisivel((atual) => deslocarMes(atual, -1))}
          >
            <Icon name="chevron-left" size={16} />
          </IconButton>
          <span className={styles.mesAtual}>
            {tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}
          </span>
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
        {DIAS_SEMANA.map((inicialDia, indice) => (
          <span key={`${inicialDia}-${indice}`} className={styles.diaSemana} aria-hidden="true">
            {inicialDia}
          </span>
        ))}
        {celulasVazias.map((_, indice) => (
          <span key={`vazio-${indice}`} aria-hidden="true" />
        ))}
        {dias.map((dia) => {
          const dataIso = `${ano}-${String(mesNumero).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const status = statusPorData.get(dataIso);
          const eventos = eventosPorData?.get(dataIso) ?? [];
          const partesRotulo = [
            formatarDataExtenso(dataIso),
            status ? LABEL_STATUS[status] : "Sem aula",
            ...eventos.map((evento) => `${LABEL_EVENTO[evento.tipo]}: ${evento.titulo}`),
          ];
          const rotulo = partesRotulo.join(" — ");
          return (
            <span key={dataIso} className={styles.celula} title={rotulo} aria-label={rotulo}>
              <span className={cx(styles.dia, toneClass(status))}>{dia}</span>
              {eventos.length > 0 && (
                <span className={styles.marcadores} aria-hidden="true">
                  {eventos.slice(0, 3).map((evento, indice) => (
                    <span
                      key={`${evento.tipo}-${indice}`}
                      className={cx(styles.marcador, styles[`marcador_${evento.tipo}`])}
                    />
                  ))}
                </span>
              )}
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
        <li>
          <span className={cx(styles.marcador, styles.marcador_prova)} aria-hidden="true" />
          Prova
        </li>
        <li>
          <span className={cx(styles.marcador, styles.marcador_ferias)} aria-hidden="true" />
          Férias
        </li>
        <li>
          <span className={cx(styles.marcador, styles.marcador_recuperacao)} aria-hidden="true" />
          Recuperação
        </li>
      </ul>
    </div>
  );
}
