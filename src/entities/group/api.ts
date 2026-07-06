import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { groupSchema, type Group, type Shift } from "./model";

export async function fetchGroups(): Promise<Group[]> {
  const rows = await readCollection("groups");
  return rows.map((row) => groupSchema.parse(row));
}

export async function fetchGroupById(id: string): Promise<Group | null> {
  const groups = await fetchGroups();
  return groups.find((group) => group.id === id) ?? null;
}

export interface NewGroupInput {
  name: string;
  shift: Shift;
  teacherId: string;
}

export interface GroupUpdate {
  name?: string;
  shift?: Shift;
  teacherId?: string;
}

export async function createGroup(input: NewGroupInput): Promise<Group> {
  const group: Group = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    shift: input.shift,
    teacherId: input.teacherId,
  };
  groupSchema.parse(group);
  await mutateCollection<Group>("groups", (rows) => [...rows, group]);
  return group;
}

export async function updateGroup(id: string, patch: GroupUpdate): Promise<Group> {
  const rows = await fetchGroups();
  const current = rows.find((group) => group.id === id);
  if (!current) throw new Error("Aula não encontrada.");
  const next: Group = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
    ...(patch.shift !== undefined ? { shift: patch.shift } : {}),
    ...(patch.teacherId !== undefined ? { teacherId: patch.teacherId } : {}),
  };
  groupSchema.parse(next);
  await mutateCollection<Group>("groups", (groups) => groups.map((group) => (group.id === id ? next : group)));
  return next;
}

export async function deleteGroup(id: string): Promise<void> {
  const students = await readCollection<{ groupId: string }>("students");
  const sessions = await readCollection<{ groupId: string }>("attendanceSessions");
  const inUse =
    students.some((student) => student.groupId === id) || sessions.some((session) => session.groupId === id);
  if (inUse) {
    throw new Error("Aula com alunos ou chamadas não pode ser removida.");
  }
  await mutateCollection<{ groupId: string }>("assignments", (assignments) =>
    assignments.filter((assignment) => assignment.groupId !== id),
  );
  await mutateCollection<Group>("groups", (groups) => groups.filter((group) => group.id !== id));
}
