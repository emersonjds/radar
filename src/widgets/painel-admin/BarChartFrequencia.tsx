import { cx } from "@/shared/ui/cx";
import styles from "./Charts.module.css";

export interface BarraFrequencia {
  turmaId: string;
  label: string;
  frequencia: number;
}

export interface BarChartFrequenciaProps {
  dados: BarraFrequencia[];
}

const ALTURA = 200;
const LARGURA_BARRA = 40;

export function BarChartFrequencia({ dados }: BarChartFrequenciaProps) {
  if (dados.length === 0) {
    return <p className={styles.vazio}>Sem dados ainda.</p>;
  }

  const largura = Math.max(dados.length * 72, 240);
  const slot = largura / dados.length;
  const resumo = dados.map((item) => `${item.label}: ${item.frequencia}%`).join(", ");

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBox}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${largura} ${ALTURA + 24}`}
          role="img"
          aria-label={`Frequência por turma — ${resumo}`}
        >
          {[0, 25, 50, 75, 100].map((marca) => {
            const y = ALTURA - (marca / 100) * ALTURA;
            return <line key={marca} x1={0} x2={largura} y1={y} y2={y} className={styles.gridline} />;
          })}
          {dados.map((item, index) => {
            const x = index * slot + (slot - LARGURA_BARRA) / 2;
            const alturaPresente = (item.frequencia / 100) * ALTURA;
            const alturaAusente = ALTURA - alturaPresente;
            return (
              <g key={item.turmaId}>
                <rect x={x} y={0} width={LARGURA_BARRA} height={alturaAusente} className={styles.barAusente} />
                <rect
                  x={x}
                  y={alturaAusente}
                  width={LARGURA_BARRA}
                  height={alturaPresente}
                  className={styles.barPresente}
                />
                <text x={x + LARGURA_BARRA / 2} y={ALTURA + 18} textAnchor="middle" className={styles.axisLabel}>
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
            <tr key={item.turmaId}>
              <td>{item.label}</td>
              <td>{item.frequencia}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
