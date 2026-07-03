import { cx } from "@/shared/ui/cx";
import styles from "./Charts.module.css";

export interface FrequencyBar {
  groupId: string;
  label: string;
  attendance: number;
}

export interface AttendanceBarChartProps {
  dados: FrequencyBar[];
}

/* Superfície de desenho fixa com o mesmo aspecto do .chartBox (720/268):
   o SVG preenche o card sem esticar nem sobrar borda. */
const LARGURA = 720;
const ALTURA_PLOT = 220;
const PAD_TOPO = 20;
const PAD_ESQ = 40;
const PAD_DIR = 8;
const ALTURA = PAD_TOPO + ALTURA_PLOT + 28;
const BASE = PAD_TOPO + ALTURA_PLOT;
const LARGURA_MAX_BARRA = 48;
const GAP_SEGMENTOS = 2;

export function AttendanceBarChart({ dados }: AttendanceBarChartProps) {
  if (dados.length === 0) {
    return <p className={styles.vazio}>Sem dados ainda.</p>;
  }

  const larguraPlot = LARGURA - PAD_ESQ - PAD_DIR;
  const slot = larguraPlot / dados.length;
  const larguraBarra = Math.min(LARGURA_MAX_BARRA, slot * 0.4);
  const resumo = dados.map((item) => `${item.label}: ${item.attendance}%`).join(", ");

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBox}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          role="img"
          aria-label={`Frequência por turma — ${resumo}`}
        >
          {[0, 25, 50, 75, 100].map((marca) => {
            const y = BASE - (marca / 100) * ALTURA_PLOT;
            return (
              <g key={marca}>
                <line x1={PAD_ESQ} x2={LARGURA - PAD_DIR} y1={y} y2={y} className={styles.gridline} />
                <text x={PAD_ESQ - 8} y={y + 3} textAnchor="end" className={styles.tickLabel}>
                  {marca}%
                </text>
              </g>
            );
          })}
          {dados.map((item, index) => {
            const x = PAD_ESQ + index * slot + (slot - larguraBarra) / 2;
            const yPresente = BASE - (item.attendance / 100) * ALTURA_PLOT;
            const alturaPresente = BASE - yPresente;
            const alturaAusente = Math.max(0, yPresente - PAD_TOPO - GAP_SEGMENTOS);
            return (
              <g key={item.groupId}>
                <title>{`${item.label}: ${item.attendance}% presente`}</title>
                <rect
                  x={x}
                  y={PAD_TOPO}
                  width={larguraBarra}
                  height={alturaAusente}
                  rx={4}
                  className={styles.barAusente}
                />
                <rect
                  x={x}
                  y={yPresente}
                  width={larguraBarra}
                  height={alturaPresente}
                  rx={4}
                  className={styles.barPresente}
                />
                {alturaPresente >= 28 && (
                  <text
                    x={x + larguraBarra / 2}
                    y={yPresente + 17}
                    textAnchor="middle"
                    className={styles.valueLabel}
                  >
                    {item.attendance}%
                  </text>
                )}
                <text x={x + larguraBarra / 2} y={BASE + 20} textAnchor="middle" className={styles.axisLabel}>
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={cx(styles.swatch, styles.swatchPresente)} /> Presente
        </span>
        <span className={styles.legendItem}>
          <span className={cx(styles.swatch, styles.swatchAusente)} /> Ausente
        </span>
      </div>
      <table className={styles.srOnly}>
        <caption>Frequência por turma</caption>
        <thead>
          <tr>
            <th>Turma</th>
            <th>Frequência</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.groupId}>
              <td>{item.label}</td>
              <td>{item.attendance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
