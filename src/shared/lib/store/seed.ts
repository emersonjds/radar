import type { Aluno, Chamada, Perfil, Presenca, RadarDb, StatusPresenca, Turma } from "./db";

// Fixed anchor keeps the seed deterministic (no Date.now()) while still reading as "recent".
const ANCHOR_DATE = "2026-06-30";

function subtractDays(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const ms = Date.UTC(year, month - 1, day) - days * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

const NOMES_ALUNOS = [
  "Ana Souza", "Bruno Lima", "Carla Dias", "Diego Alves", "Elisa Rocha", "Fábio Nunes", "Gabriela Melo", "Hugo Castro",
  "Igor Farias", "Julia Prado", "Kaique Teixeira", "Larissa Gomes", "Marina Duarte", "Nicolas Barros", "Olívia Ramos", "Pedro Correia",
  "Queila Vidal", "Rafael Pires", "Sofia Martins", "Tiago Andrade", "Ursula Peixoto", "Vitor Salles", "Wanda Freitas", "Xavier Moraes",
];

// Cycle of 6 statuses: 4 count as presença, 2 as falta (~33% absence baseline).
const STATUS_CICLO: StatusPresenca[] = ["presente", "presente", "atrasado", "ausente", "presente", "justificado"];

const CHAMADAS_POR_TURMA = 4;
const OFFSETS_DIAS = [0, 7, 14, 20]; // spread across the previous 3 weeks

const TURMAS_SEED: { id: string; nome: string; serie: string; turno: Turma["turno"]; professorId: string }[] = [
  { id: "turma-1", nome: "6ºA", serie: "6", turno: "manha", professorId: "professor-1" },
  { id: "turma-2", nome: "7ºB", serie: "7", turno: "tarde", professorId: "professor-1" },
  { id: "turma-3", nome: "8ºC", serie: "8", turno: "manha", professorId: "professor-2" },
];

const ALUNOS_POR_TURMA = 8;

export function buildSeed(): RadarDb {
  const perfis: Perfil[] = [
    { id: "admin-1", nome: "Ana Admin", email: "admin@radar.escola", papel: "admin" },
    { id: "professor-1", nome: "Carla Professora", email: "carla@radar.escola", papel: "professor" },
    { id: "professor-2", nome: "Marcos Professor", email: "marcos@radar.escola", papel: "professor" },
  ];

  const turmas: Turma[] = TURMAS_SEED.map((turma) => ({ ...turma }));

  const alunos: Aluno[] = [];
  turmas.forEach((turma, turmaIdx) => {
    for (let i = 0; i < ALUNOS_POR_TURMA; i++) {
      alunos.push({
        id: `aluno-${turmaIdx + 1}-${i + 1}`,
        nome: NOMES_ALUNOS[turmaIdx * ALUNOS_POR_TURMA + i],
        matricula: `${turmaIdx + 1}${String(i + 1).padStart(2, "0")}`,
        turmaId: turma.id,
        ativo: true,
      });
    }
  });

  const chamadas: Chamada[] = [];
  const presencas: Presenca[] = [];
  turmas.forEach((turma, turmaIdx) => {
    const alunosDaTurma = alunos.filter((aluno) => aluno.turmaId === turma.id);
    for (let chamadaIdx = 0; chamadaIdx < CHAMADAS_POR_TURMA; chamadaIdx++) {
      const chamadaId = `chamada-${turmaIdx + 1}-${chamadaIdx + 1}`;
      chamadas.push({
        id: chamadaId,
        turmaId: turma.id,
        data: subtractDays(ANCHOR_DATE, OFFSETS_DIAS[chamadaIdx]),
        professorId: turma.professorId,
      });
      alunosDaTurma.forEach((aluno, alunoIdx) => {
        const status = STATUS_CICLO[(alunoIdx + chamadaIdx * 2) % STATUS_CICLO.length];
        presencas.push({
          id: `presenca-${chamadaId}-${aluno.id}`,
          chamadaId,
          alunoId: aluno.id,
          status,
        });
      });
    }
  });

  return { perfis, turmas, alunos, chamadas, presencas };
}
