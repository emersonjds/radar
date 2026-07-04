import type { Db } from "./db";

/**
 * Demo dataset for the localStorage phase. Plain literals + deterministic
 * generation (no randomness) so every reload yields identical analytics.
 * Names/ids are fake — never real student PII.
 */

const PROFESSOR_ID = "perfil-ricardo";
const ADMIN_ID = "perfil-ana";

const TURMAS = [
  { id: "turma-mat-b", name: "Matemática Avançada II", gradeLevel: "3ª série", shift: "manhã" },
  { id: "turma-fis-a", name: "Física I", gradeLevel: "2ª série", shift: "manhã" },
  { id: "turma-cie-c", name: "Ciências Gerais", gradeLevel: "1ª série", shift: "afternoon" },
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

type SeedStatus = "present" | "absent" | "late" | "excused";

// Students carrying more absences — drives the "aluno em risco" panels.
const EM_RISCO = new Set([0, 1, 2]);

function statusFor(alunoIdx: number, dataIdx: number): SeedStatus {
  if (EM_RISCO.has(alunoIdx)) {
    if (dataIdx % 2 === 0) return "absent";
    if (dataIdx % 3 === 0) return "late";
    return "present";
  }
  const cycle = (alunoIdx + dataIdx) % 11;
  if (cycle === 4) return "late";
  if (cycle === 7) return "excused";
  if (cycle === 9) return "absent";
  return "present";
}

export function seedDb(): Db {
  const perfis = [
    { id: PROFESSOR_ID, name: "Ricardo Alves", email: "ricardo@radar.escola", role: "teacher", jobTitle: "Professor Titular" },
    { id: ADMIN_ID, name: "Ana Vance", email: "ana@radar.escola", role: "admin", jobTitle: "Coordenação" },
  ];

  const turmas = TURMAS.map((turma) => ({ ...turma, teacherId: PROFESSOR_ID }));

  const alunos = NOMES.map((name, index) => ({
    id: `aluno-${index + 1}`,
    name,
    enrollment: `EDU-2026-${String(1000 + index)}`,
    groupId: TURMAS[index % TURMAS.length].id,
    active: true,
  }));

  const chamadas: Db["attendanceSessions"] = [];
  const presencas: Db["attendanceRecords"] = [];

  for (const turma of turmas) {
    const turmaAlunos = alunos.filter((aluno) => aluno.groupId === turma.id);
    DATAS.forEach((data, dataIdx) => {
      const sessionId = `chamada-${turma.id}-${data}`;
      chamadas.push({
        id: sessionId,
        groupId: turma.id,
        date: data,
        teacherId: PROFESSOR_ID,
      });
      turmaAlunos.forEach((aluno) => {
        presencas.push({
          id: `presenca-${sessionId}-${aluno.id}`,
          sessionId,
          studentId: aluno.id,
          status: statusFor(Number(aluno.id.split("-")[1]) - 1, dataIdx),
        });
      });
    });
  }

  // Calendário escolar de demonstração — recesso e recuperação de julho/2026.
  const eventosEscolares = [
    { id: "evento-ferias-julho", type: "vacation", title: "Férias de julho", startDate: "2026-07-06", endDate: "2026-07-24" },
    { id: "evento-recuperacao-julho", type: "makeup", title: "Recuperação semestral", startDate: "2026-07-27", endDate: "2026-07-31" },
  ];

  return {
    profiles: perfis,
    groups: turmas,
    students: alunos,
    attendanceSessions: chamadas,
    attendanceRecords: presencas,
    schoolEvents: eventosEscolares,
  };
}
