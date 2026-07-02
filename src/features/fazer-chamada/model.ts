import type { Aluno, StatusPresenca } from "@/shared/lib/store/db";

export interface Registro {
  alunoId: string;
  status: StatusPresenca;
}

export function montarRegistrosIniciais(alunos: Aluno[]): Registro[] {
  return alunos.map((aluno) => ({ alunoId: aluno.id, status: "presente" }));
}

export function toggleStatus(registros: Registro[], alunoId: string, status: StatusPresenca): Registro[] {
  return registros.map((registro) => (registro.alunoId === alunoId ? { ...registro, status } : registro));
}
