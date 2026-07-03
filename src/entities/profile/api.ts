import { readCollection } from "@/shared/lib/storage/db";
import { profileSchema, type Role, type Profile } from "./model";

export async function fetchProfiles(): Promise<Profile[]> {
  const rows = await readCollection("profiles");
  return rows.map((row) => profileSchema.parse(row));
}

export async function fetchProfileByRole(role: Role): Promise<Profile | null> {
  const profiles = await fetchProfiles();
  return profiles.find((profile) => profile.role === role) ?? null;
}
