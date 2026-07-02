import type { Db } from "./db";

/**
 * Demo dataset for the localStorage phase. Plain literals + deterministic
 * generation (no randomness) so every reload yields identical analytics.
 * Names/ids are fake — never real student PII.
 */

const PROFESSOR_ID = "perfil-ricardo";
const ADMIN_ID = "perfil-ana";

const TURMAS = [
  { id: "turma-mat-b", nome: "Matemática Avançada II", serie: "3ª série", turno: "manhã" },
  { id: "turma-fis-a", nome: "Física I", serie: "2ª série", turno: "manhã" },
  { id: "turma-cie-c", nome: "Ciências Gerais", serie: "1ª série", turno: "tarde" },
];

// Weekday ISO dates leading up to 2026-07-01, oldest first.
const DATAS = [
  "2026-06-16",
  "2026-06-18",
  "2026-06-23",
  "2026-06-25",
  "2026-06-30",
  "2026-07-01",
];

const NOMES = [
  "Marcus Thorne", "Sasha Kim", "Julian Rossi", "Elena Rodrigues", "Tobias Jenkins",
  "Amara Gupta", "Benjamin Harrison", "Clara Mendes", "Diego Santos", "Fatima Oliveira",
  "Gabriel Lima", "Helena Costa", "Igor Petrov", "Julia Ferreira", "Kaique Souza",
  "Lara Nunes", "Mateus Rocha", "Nina Barros",
];

type SeedStatus = "presente" | "ausente" | "atrasado" | "justificado";

// Students carrying more absences — drives the "aluno em risco" panels.
const EM_RISCO = new Set([0, 1, 2]);

function statusFor(alunoIdx: number, dataIdx: number): SeedStatus {
  if (EM_RISCO.has(alunoIdx)) {
    if (dataIdx % 2 === 0) return "ausente";
    if (dataIdx % 3 === 0) return "atrasado";
    return "presente";
  }
  const cycle = (alunoIdx + dataIdx) % 11;
  if (cycle === 4) return "atrasado";
  if (cycle === 7) return "justificado";
  if (cycle === 9) return "ausente";
  return "presente";
}

export function seedDb(): Db {
  const perfis = [
    { id: PROFESSOR_ID, nome: "Ricardo Alves", email: "ricardo@radar.escola", papel: "professor", cargo: "Professor Titular" },
    { id: ADMIN_ID, nome: "Ana Vance", email: "ana@radar.escola", papel: "admin", cargo: "Coordenação" },
  ];

  const turmas = TURMAS.map((turma) => ({ ...turma, professorId: PROFESSOR_ID }));

  const alunos = NOMES.map((nome, index) => ({
    id: `aluno-${index + 1}`,
    nome,
    matricula: `EDU-2026-${String(1000 + index)}`,
    turmaId: TURMAS[index % TURMAS.length].id,
    ativo: true,
  }));

  const chamadas: Db["chamadas"] = [];
  const presencas: Db["presencas"] = [];

  for (const turma of turmas) {
    const turmaAlunos = alunos.filter((aluno) => aluno.turmaId === turma.id);
    DATAS.forEach((data, dataIdx) => {
      const chamadaId = `chamada-${turma.id}-${data}`;
      chamadas.push({
        id: chamadaId,
        turmaId: turma.id,
        data,
        professorId: PROFESSOR_ID,
      });
      turmaAlunos.forEach((aluno) => {
        presencas.push({
          id: `presenca-${chamadaId}-${aluno.id}`,
          chamadaId,
          alunoId: aluno.id,
          status: statusFor(Number(aluno.id.split("-")[1]) - 1, dataIdx),
        });
      });
    });
  }

  return { perfis, turmas, alunos, chamadas, presencas };
}
