import type { RadarDb, StatusPresenca } from "./db";

const STATUS_PRESENCA: StatusPresenca[] = ["presente", "atrasado"];
const STATUS_FALTA: StatusPresenca[] = ["ausente", "justificado"];

function isPresenca(status: StatusPresenca): boolean {
  return STATUS_PRESENCA.includes(status);
}

function isFalta(status: StatusPresenca): boolean {
  return STATUS_FALTA.includes(status);
}

function pct(numerador: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((numerador / total) * 1000) / 10;
}

export function frequenciaPorTurma(
  db: RadarDb,
): { turmaId: string; turmaNome: string; total: number; presentes: number; pct: number }[] {
  return db.turmas.map((turma) => {
    const chamadaIds = new Set(db.chamadas.filter((c) => c.turmaId === turma.id).map((c) => c.id));
    const presencas = db.presencas.filter((p) => chamadaIds.has(p.chamadaId));
    const presentes = presencas.filter((p) => isPresenca(p.status)).length;
    return {
      turmaId: turma.id,
      turmaNome: turma.nome,
      total: presencas.length,
      presentes,
      pct: pct(presentes, presencas.length),
    };
  });
}

export function frequenciaPorAluno(
  db: RadarDb,
  turmaId: string,
): { alunoId: string; alunoNome: string; matricula: string; total: number; faltas: number; pct: number }[] {
  return db.alunos
    .filter((aluno) => aluno.turmaId === turmaId)
    .map((aluno) => {
      const presencas = db.presencas.filter((p) => p.alunoId === aluno.id);
      const faltas = presencas.filter((p) => isFalta(p.status)).length;
      const presentes = presencas.length - faltas;
      return {
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        matricula: aluno.matricula,
        total: presencas.length,
        faltas,
        pct: pct(presentes, presencas.length),
      };
    });
}

export function tendenciaAbsenteismo(db: RadarDb, desde: string): { data: string; pctAusencia: number }[] {
  const datas = Array.from(new Set(db.chamadas.filter((c) => c.data >= desde).map((c) => c.data))).sort();
  return datas.map((data) => {
    const chamadaIds = new Set(db.chamadas.filter((c) => c.data === data).map((c) => c.id));
    const presencas = db.presencas.filter((p) => chamadaIds.has(p.chamadaId));
    const faltas = presencas.filter((p) => isFalta(p.status)).length;
    return { data, pctAusencia: pct(faltas, presencas.length) };
  });
}

export function alunosEmRisco(
  db: RadarDb,
  limite: number,
): { alunoId: string; alunoNome: string; turmaNome: string; pctFalta: number }[] {
  const turmasPorId = new Map(db.turmas.map((turma) => [turma.id, turma]));
  return db.alunos
    .map((aluno) => {
      const presencas = db.presencas.filter((p) => p.alunoId === aluno.id);
      const faltas = presencas.filter((p) => isFalta(p.status)).length;
      const turma = turmasPorId.get(aluno.turmaId);
      return {
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        turmaNome: turma?.nome ?? "",
        pctFalta: pct(faltas, presencas.length),
      };
    })
    .filter((registro) => registro.pctFalta > limite);
}
