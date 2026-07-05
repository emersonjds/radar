import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { evaluationSchema, type Evaluation, type EvaluationType } from "./model";

export async function fetchEvaluations(): Promise<Evaluation[]> {
  const rows = await readCollection("evaluations");
  return rows.map((row) => evaluationSchema.parse(row));
}

export async function fetchEvaluationsByAssignment(
  groupId: string,
  subjectId: string,
): Promise<Evaluation[]> {
  const evaluations = await fetchEvaluations();
  return evaluations.filter((e) => e.groupId === groupId && e.subjectId === subjectId);
}

export interface NewEvaluationInput {
  groupId: string;
  subjectId: string;
  name: string;
  type: EvaluationType;
  date: string;
  weight: number;
}

export async function createEvaluation(input: NewEvaluationInput): Promise<Evaluation> {
  const evaluations = await fetchEvaluations();
  const name = input.name.trim();
  const duplicate = evaluations.some(
    (e) =>
      e.groupId === input.groupId &&
      e.subjectId === input.subjectId &&
      e.name === name &&
      e.date === input.date,
  );
  if (duplicate) {
    throw new Error("Já existe uma avaliação com esse nome e data nesta turma/matéria.");
  }
  const evaluation: Evaluation = {
    id: crypto.randomUUID(),
    groupId: input.groupId,
    subjectId: input.subjectId,
    name,
    type: input.type,
    date: input.date,
    weight: input.weight,
  };
  evaluationSchema.parse(evaluation);
  await mutateCollection<Evaluation>("evaluations", (rows) => [...rows, evaluation]);
  return evaluation;
}

export interface EvaluationUpdate {
  name?: string;
  type?: EvaluationType;
  date?: string;
  weight?: number;
}

export async function updateEvaluation(id: string, patch: EvaluationUpdate): Promise<Evaluation> {
  const rows = await fetchEvaluations();
  const current = rows.find((e) => e.id === id);
  if (!current) throw new Error("Avaliação não encontrada.");
  const next: Evaluation = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.type !== undefined ? { type: patch.type } : {}),
    ...(patch.date !== undefined ? { date: patch.date } : {}),
    ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
  };
  evaluationSchema.parse(next);
  await mutateCollection<Evaluation>("evaluations", (evaluations) =>
    evaluations.map((e) => (e.id === id ? next : e)),
  );
  return next;
}

export async function deleteEvaluation(id: string): Promise<void> {
  // Cascade: an evaluation owns its grades.
  await mutateCollection<{ evaluationId: string }>("evaluationGrades", (rows) =>
    rows.filter((row) => row.evaluationId !== id),
  );
  await mutateCollection<Evaluation>("evaluations", (rows) => rows.filter((e) => e.id !== id));
}
