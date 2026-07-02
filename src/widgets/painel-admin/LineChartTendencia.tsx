import { formatarData } from "@/shared/lib/format";
import styles from "./Charts.module.css";

export interface PontoTendencia {
  data: string;
  frequencia: number;
}

export interface LineChartTendenciaProps {
  pontos: PontoTendencia[];
}

const ALTURA = 180;

export function LineChartTendencia({ pontos }: LineChartTendenciaProps) {
  if (pontos.length === 0) {
    return <p className={styles.vazio}>Sem dados ainda.</p>;
  }

  const largura = Math.max(pontos.length * 90, 240);
  const passoX = pontos.length > 1 ? largura / (pontos.length - 1) : 0;
  const coords = pontos.map((ponto, index) => ({
    ...ponto,
    x: passoX * index,
    y: ALTURA - (ponto.frequencia / 100) * ALTURA,
  }));
  const resumo = pontos.map((ponto) => `${formatarData(ponto.data)}: ${ponto.frequencia}%`).join(", ");

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBox}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${largura} ${ALTURA + 24}`}
          role="img"
          aria-label={`Tendência de frequência — ${resumo}`}
        >
          {[0, 25, 50, 75, 100].map((marca) => {
            const y = ALTURA - (marca / 100) * ALTURA;
            return <line key={marca} x1={0} x2={largura} y1={y} y2={y} className={styles.gridline} />;
          })}
          <polyline points={coords.map((c) => `${c.x},${c.y}`).join(" ")} className={styles.linha} />
          {coords.map((c) => (
            <circle key={c.data} cx={c.x} cy={c.y} r={4} className={styles.ponto} />
          ))}
          {coords.map((c) => (
            <text key={c.data} x={c.x} y={ALTURA + 18} textAnchor="middle" className={styles.axisLabel}>
              {formatarData(c.data).slice(0, 5)}
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
              <td>{formatarData(ponto.data)}</td>
              <td>{ponto.frequencia}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
