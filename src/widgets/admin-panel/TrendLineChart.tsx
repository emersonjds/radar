import { formatDate } from "@/shared/lib/format";
import styles from "./Charts.module.css";

export interface TrendPoint {
  data: string;
  attendance: number;
}

export interface TrendLineChartProps {
  pontos: TrendPoint[];
}

/* Mesma superfície do AttendanceBarChart (720/268) para os cards ficarem consistentes. */
const LARGURA = 720;
const ALTURA_PLOT = 220;
const PAD_TOPO = 20;
const PAD_ESQ = 40;
const PAD_DIR = 16;
const ALTURA = PAD_TOPO + ALTURA_PLOT + 28;
const BASE = PAD_TOPO + ALTURA_PLOT;

export function TrendLineChart({ pontos }: TrendLineChartProps) {
  if (pontos.length === 0) {
    return <p className={styles.vazio}>Sem dados ainda.</p>;
  }

  const larguraPlot = LARGURA - PAD_ESQ - PAD_DIR;
  const passoX = pontos.length > 1 ? larguraPlot / (pontos.length - 1) : 0;
  const pontosPosicionados = pontos.map((ponto, indice) => ({
    ...ponto,
    x: pontos.length > 1 ? PAD_ESQ + passoX * indice : PAD_ESQ + larguraPlot / 2,
    y: BASE - (ponto.attendance / 100) * ALTURA_PLOT,
  }));
  const resumo = pontos.map((ponto) => `${formatDate(ponto.data)}: ${ponto.attendance}%`).join(", ");

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBox}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          role="img"
          aria-label={`Tendência de frequência — ${resumo}`}
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
          <polyline
            points={pontosPosicionados.map((ponto) => `${ponto.x},${ponto.y}`).join(" ")}
            className={styles.linha}
          />
          {pontosPosicionados.map((ponto) => (
            <g key={ponto.data}>
              <title>{`${formatDate(ponto.data)}: ${ponto.attendance}%`}</title>
              <circle cx={ponto.x} cy={ponto.y} r={4.5} className={styles.ponto} />
            </g>
          ))}
          {pontosPosicionados.map((ponto) => (
            <text key={ponto.data} x={ponto.x} y={BASE + 20} textAnchor="middle" className={styles.axisLabel}>
              {formatDate(ponto.data).slice(0, 5)}
            </text>
          ))}
        </svg>
      </div>
      <table className={styles.srOnly}>
        <caption>Tendência de frequência por data</caption>
        <thead>
          <tr>
            <th>Data</th>
            <th>Frequência</th>
          </tr>
        </thead>
        <tbody>
          {pontos.map((ponto) => (
            <tr key={ponto.data}>
              <td>{formatDate(ponto.data)}</td>
              <td>{ponto.attendance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
