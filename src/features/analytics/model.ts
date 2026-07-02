import {
  STATUS_PRESENTE,
  type Presenca,
  type StatusPresenca,
} from "@/entities/presenca/model";

/** Attendance rate (0–100) — presente + atrasado count as present. */
export function taxaFrequencia(presencas: Presenca[]): number {
  if (presencas.length === 0) return 0;
  const presentes = presencas.filter((presenca) =>
    STATUS_PRESENTE.includes(presenca.status),
  ).length;
  return Math.round((presentes / presencas.length) * 100);
}

export function contarFaltas(presencas: Presenca[]): number {
  return presencas.filter((presenca) => presenca.status === "ausente").length;
}

export interface AlunoRisco {
  alunoId: string;
  faltas: number;
  frequencia: number;
}

/** Students with absences at or above `limiteFaltas`, worst first. */
export function alunosEmRisco(
  presencasPorAluno: Map<string, Presenca[]>,
  limiteFaltas: number,
): AlunoRisco[] {
  const risco: AlunoRisco[] = [];
  for (const [alunoId, presencas] of presencasPorAluno) {
    const faltas = contarFaltas(presencas);
    if (faltas >= limiteFaltas) {
      risco.push({ alunoId, faltas, frequencia: taxaFrequencia(presencas) });
    }
  }
  return risco.sort((a, b) => b.faltas - a.faltas);
}

export interface PontoAbsenteismo {
  data: string;
  taxaFalta: number;
}

/** Absence rate per session date, chronological — feeds the trend chart. */
export function tendenciaAbsenteismo(
  registros: { data: string; status: StatusPresenca }[],
): PontoAbsenteismo[] {
  const porData = new Map<string, { total: number; ausentes: number }>();
  for (const registro of registros) {
    const bucket = porData.get(registro.data) ?? { total: 0, ausentes: 0 };
    bucket.total += 1;
    if (registro.status === "ausente") bucket.ausentes += 1;
    porData.set(registro.data, bucket);
  }
  return [...porData.entries()]
    .map(([data, { total, ausentes }]) => ({
      data,
      taxaFalta: total === 0 ? 0 : Math.round((ausentes / total) * 100),
    }))
    .sort((a, b) => a.data.localeCompare(b.data));
}
