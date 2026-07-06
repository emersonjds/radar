import type { Db } from "./db";

/**
 * Demo dataset for the localStorage phase. Plain literals + deterministic
 * generation (no randomness) so every reload yields identical analytics.
 * Names/ids are fake — never real student PII.
 */

const PROFESSOR_ID = "perfil-ricardo";
const TEACHER_TWO_ID = "perfil-bruno";
const ADMIN_ID = "perfil-ana";
const COORDINATOR_ID = "perfil-carla";

const TURMAS = [
  { id: "turma-mat-b", name: "Reforço de Matemática — Segunda", shift: "afternoon" },
  { id: "turma-fis-a", name: "Reforço de Física — Terça", shift: "afternoon" },
  { id: "turma-cie-c", name: "Reforço de Ciências — Quarta", shift: "afternoon" },
];

// Weekday ISO dates leading up to 2026-07-01, oldest first.
const DATAS = ["2026-06-16", "2026-06-18", "2026-06-23", "2026-06-25", "2026-06-30", "2026-07-01"];

const NOMES = [
  "Marcus Thorne",
  "Sasha Kim",
  "Julian Rossi",
  "Elena Rodrigues",
  "Tobias Jenkins",
  "Amara Gupta",
  "Benjamin Harrison",
  "Clara Mendes",
  "Diego Santos",
  "Fatima Oliveira",
  "Gabriel Lima",
  "Helena Costa",
  "Igor Petrov",
  "Julia Ferreira",
  "Kaique Souza",
  "Lara Nunes",
  "Mateus Rocha",
  "Nina Barros",
];

// 8 matérias, 2 por área — base para notas, matérias de destaque e aptidão.
const MATERIAS = [
  { id: "materia-matematica", name: "Matemática", area: "exatas" },
  { id: "materia-fisica", name: "Física", area: "exatas" },
  { id: "materia-biologia", name: "Biologia", area: "biologicas" },
  { id: "materia-quimica", name: "Química", area: "biologicas" },
  { id: "materia-portugues", name: "Português", area: "linguagens" },
  { id: "materia-ingles", name: "Inglês", area: "linguagens" },
  { id: "materia-historia", name: "História", area: "humanas" },
  { id: "materia-geografia", name: "Geografia", area: "humanas" },
] as const;

const AREAS_SEED = ["exatas", "biologicas", "linguagens", "humanas"] as const;

// Nota determinística: cada aluno tem uma área preferida (ciclando pelo índice),
// onde tira notas altas; nas demais, mais baixas — gera aptidões variadas.
function scoreFor(alunoIdx: number, materiaIdx: number, area: string): number {
  const areaPreferida = AREAS_SEED[alunoIdx % AREAS_SEED.length];
  const base = area === areaPreferida ? 8.6 : 5.8;
  const wobble = (((alunoIdx * 5 + materiaIdx * 3) % 17) - 8) / 10;
  const bruto = base + wobble;
  return Math.max(0, Math.min(10, Math.round(bruto * 10) / 10));
}

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
  // Demo credentials (username / password): ricardo / prof123, ana / admin123,
  // carla / coord123. passwordHash is the SHA-256 hex of the password
  // (shared/lib/auth/password) — temporary until Supabase Auth.
  const perfis = [
    {
      id: PROFESSOR_ID,
      name: "Ricardo Alves",
      email: "ricardo@radar.escola",
      role: "teacher",
      jobTitle: "Professor Titular",
      username: "ricardo",
      passwordHash: "00624b02e1f9b996a3278f559d5d55313552ad2c0bafc82adfd975c12df61eaf",
      active: true,
    },
    {
      id: ADMIN_ID,
      name: "Ana Vance",
      email: "ana@radar.escola",
      role: "admin",
      jobTitle: "Administração",
      username: "ana",
      passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
      active: true,
    },
    {
      id: COORDINATOR_ID,
      name: "Carla Dias",
      email: "carla@radar.escola",
      role: "coordinator",
      jobTitle: "Coordenação Pedagógica",
      username: "carla",
      passwordHash: "8c63a2fc2b14d8ae6f9d0bf2e2c4227ac2dc4bd84768e1259226b0c3d84f1c65",
      active: true,
    },
    {
      id: TEACHER_TWO_ID,
      name: "Bruno Farias",
      email: "bruno@radar.escola",
      role: "teacher",
      jobTitle: "Professor",
      username: "bruno",
      passwordHash: "00624b02e1f9b996a3278f559d5d55313552ad2c0bafc82adfd975c12df61eaf",
      active: true,
    },
  ];

  const REGENTE_POR_TURMA: Record<string, string> = {
    "turma-mat-b": PROFESSOR_ID,
    "turma-fis-a": PROFESSOR_ID,
    "turma-cie-c": TEACHER_TWO_ID,
  };
  const turmas = TURMAS.map((turma) => ({ ...turma, teacherId: REGENTE_POR_TURMA[turma.id] }));

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
        teacherId: turma.teacherId,
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
    {
      id: "evento-ferias-julho",
      type: "vacation",
      title: "Férias de julho",
      startDate: "2026-07-06",
      endDate: "2026-07-24",
    },
    {
      id: "evento-recuperacao-julho",
      type: "makeup",
      title: "Recuperação semestral",
      startDate: "2026-07-27",
      endDate: "2026-07-31",
    },
  ];

  const materias = MATERIAS.map((materia) => ({ ...materia }));

  const assignments = [
    { id: "assign-matb-mat", groupId: "turma-mat-b", subjectId: "materia-matematica", teacherId: PROFESSOR_ID },
    { id: "assign-matb-fis", groupId: "turma-mat-b", subjectId: "materia-fisica", teacherId: PROFESSOR_ID },
    { id: "assign-matb-his", groupId: "turma-mat-b", subjectId: "materia-historia", teacherId: TEACHER_TWO_ID },
    { id: "assign-fisa-fis", groupId: "turma-fis-a", subjectId: "materia-fisica", teacherId: PROFESSOR_ID },
    { id: "assign-fisa-ing", groupId: "turma-fis-a", subjectId: "materia-ingles", teacherId: TEACHER_TWO_ID },
    { id: "assign-ciec-bio", groupId: "turma-cie-c", subjectId: "materia-biologia", teacherId: TEACHER_TWO_ID },
    { id: "assign-ciec-por", groupId: "turma-cie-c", subjectId: "materia-portugues", teacherId: PROFESSOR_ID },
  ];

  const evaluations: Db["evaluations"] = [];
  const evaluationGrades: Db["evaluationGrades"] = [];
  for (const assignment of assignments) {
    const materiaIdx = MATERIAS.findIndex((m) => m.id === assignment.subjectId);
    const area = MATERIAS[materiaIdx].area;
    const groupStudents = alunos.filter((aluno) => aluno.groupId === assignment.groupId);
    const examId = `eval-${assignment.id}-p1`;
    const homeworkId = `eval-${assignment.id}-t1`;
    evaluations.push(
      {
        id: examId,
        groupId: assignment.groupId,
        subjectId: assignment.subjectId,
        name: "P1",
        type: "exam",
        date: "2026-06-20",
        weight: 3,
      },
      {
        id: homeworkId,
        groupId: assignment.groupId,
        subjectId: assignment.subjectId,
        name: "Trabalho 1",
        type: "homework",
        date: "2026-06-27",
        weight: 1,
      },
    );
    for (const aluno of groupStudents) {
      const alunoIdx = Number(aluno.id.split("-")[1]) - 1;
      const examScore = scoreFor(alunoIdx, materiaIdx, area);
      const homeworkScore = Math.min(10, Math.round((examScore + 0.5) * 10) / 10);
      evaluationGrades.push(
        { id: `eg-${examId}-${aluno.id}`, evaluationId: examId, studentId: aluno.id, score: examScore },
        { id: `eg-${homeworkId}-${aluno.id}`, evaluationId: homeworkId, studentId: aluno.id, score: homeworkScore },
      );
    }
  }

  return {
    profiles: perfis,
    groups: turmas,
    students: alunos,
    attendanceSessions: chamadas,
    attendanceRecords: presencas,
    schoolEvents: eventosEscolares,
    subjects: materias,
    assignments,
    evaluations,
    evaluationGrades,
  };
}
