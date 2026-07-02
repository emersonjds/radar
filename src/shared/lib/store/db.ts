import { buildSeed } from "./seed";

export type Papel = "professor" | "admin";
export type StatusPresenca = "presente" | "ausente" | "atrasado" | "justificado";

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  turno: "manha" | "tarde" | "noite";
  professorId: string;
}

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turmaId: string;
  ativo: boolean;
}

export interface Chamada {
  id: string;
  turmaId: string;
  data: string; // YYYY-MM-DD
  professorId: string;
}

export interface Presenca {
  id: string;
  chamadaId: string;
  alunoId: string;
  status: StatusPresenca;
}

export interface RadarDb {
  perfis: Perfil[];
  turmas: Turma[];
  alunos: Aluno[];
  chamadas: Chamada[];
  presencas: Presenca[];
}

const STORAGE_KEY = "radar.db.v1";

export function loadDb(): RadarDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = buildSeed();
    saveDb(seeded);
    return seeded;
  }
  return JSON.parse(raw) as RadarDb;
}

export function saveDb(db: RadarDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb(): void {
  localStorage.removeItem(STORAGE_KEY);
  saveDb(buildSeed());
}
