import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { subjectSchema, type Area, type Subject } from "./model";

export async function fetchSubjects(): Promise<Subject[]> {
  const rows = await readCollection("subjects");
  return rows.map((row) => subjectSchema.parse(row));
}

export interface NewSubjectInput {
  name: string;
  area: Area;
}

export interface SubjectUpdate {
  name?: string;
  area?: Area;
}

export async function createSubject(input: NewSubjectInput): Promise<Subject> {
  const subject: Subject = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    area: input.area,
  };
  subjectSchema.parse(subject);
  await mutateCollection<Subject>("subjects", (rows) => [...rows, subject]);
  return subject;
}

export async function updateSubject(id: string, patch: SubjectUpdate): Promise<Subject> {
  const rows = await fetchSubjects();
  const current = rows.find((subject) => subject.id === id);
  if (!current) throw new Error("Matéria não encontrada.");
  const next: Subject = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.area !== undefined ? { area: patch.area } : {}),
  };
  subjectSchema.parse(next);
  await mutateCollection<Subject>("subjects", (subjects) =>
    subjects.map((subject) => (subject.id === id ? next : subject)),
  );
  return next;
}

export async function deleteSubject(id: string): Promise<void> {
  const assignments = await readCollection<{ subjectId: string }>("assignments");
  const evaluations = await readCollection<{ subjectId: string }>("evaluations");
  const inUse =
    assignments.some((assignment) => assignment.subjectId === id) ||
    evaluations.some((evaluation) => evaluation.subjectId === id);
  if (inUse) {
    throw new Error("Matéria em uso (lecionamento ou avaliação) não pode ser removida.");
  }
  await mutateCollection<Subject>("subjects", (subjects) => subjects.filter((subject) => subject.id !== id));
}
