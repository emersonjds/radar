import type { Group } from "@/entities/group/model";

/** The turmas a teacher runs roll-call for = the ones they are regente of. */
export function groupsForRegente(groups: Group[], teacherId: string | null): Group[] {
  if (!teacherId) return [];
  return groups.filter((group) => group.teacherId === teacherId);
}
