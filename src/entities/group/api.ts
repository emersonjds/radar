import { readCollection } from "@/shared/lib/storage/db";
import { groupSchema, type Group } from "./model";

export async function fetchGroups(): Promise<Group[]> {
  const rows = await readCollection("groups");
  return rows.map((row) => groupSchema.parse(row));
}

export async function fetchGroupById(id: string): Promise<Group | null> {
  const groups = await fetchGroups();
  return groups.find((group) => group.id === id) ?? null;
}
