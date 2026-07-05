import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { assignmentSchema, type Assignment } from "./model";

export async function fetchAssignments(): Promise<Assignment[]> {
  const rows = await readCollection("assignments");
  return rows.map((row) => assignmentSchema.parse(row));
}

export async function fetchAssignmentsByGroup(groupId: string): Promise<Assignment[]> {
  const assignments = await fetchAssignments();
  return assignments.filter((assignment) => assignment.groupId === groupId);
}

export async function fetchAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
  const assignments = await fetchAssignments();
  return assignments.filter((assignment) => assignment.teacherId === teacherId);
}

export interface NewAssignmentInput {
  groupId: string;
  subjectId: string;
  teacherId: string;
}

export async function createAssignment(input: NewAssignmentInput): Promise<Assignment> {
  const assignments = await fetchAssignments();
  const duplicate = assignments.some(
    (assignment) =>
      assignment.groupId === input.groupId && assignment.subjectId === input.subjectId,
  );
  if (duplicate) {
    // Surfaces to the admin in the turma panel → PT-BR copy.
    throw new Error("Esta matéria já está atribuída a esta turma.");
  }
  const assignment: Assignment = {
    id: crypto.randomUUID(),
    groupId: input.groupId,
    subjectId: input.subjectId,
    teacherId: input.teacherId,
  };
  assignmentSchema.parse(assignment);
  await mutateCollection<Assignment>("assignments", (rows) => [...rows, assignment]);
  return assignment;
}

export async function updateAssignmentTeacher(id: string, teacherId: string): Promise<void> {
  await mutateCollection<Assignment>("assignments", (rows) =>
    rows.map((assignment) => (assignment.id === id ? { ...assignment, teacherId } : assignment)),
  );
}

export async function deleteAssignment(id: string): Promise<void> {
  await mutateCollection<Assignment>("assignments", (rows) =>
    rows.filter((assignment) => assignment.id !== id),
  );
}
