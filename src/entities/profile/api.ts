import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { hashPassword } from "@/shared/lib/auth/password";
import { profileSchema, type Role, type Profile } from "./model";

export async function fetchProfiles(): Promise<Profile[]> {
  const rows = await readCollection("profiles");
  return rows.map((row) => profileSchema.parse(row));
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const profiles = await fetchProfiles();
  return profiles.find((profile) => profile.id === id) ?? null;
}

export async function fetchProfileByRole(role: Role): Promise<Profile | null> {
  const profiles = await fetchProfiles();
  return profiles.find((profile) => profile.role === role) ?? null;
}

export interface NewProfileInput {
  name: string;
  username: string;
  email: string;
  role: Role;
  password: string;
  jobTitle?: string;
}

/** Admin creates a profile below them. Username is unique (case-insensitive). */
export async function createProfile(input: NewProfileInput): Promise<Profile> {
  const username = input.username.trim().toLowerCase();
  const existing = await fetchProfiles();
  if (existing.some((profile) => profile.username === username)) {
    throw new Error("Nome de usuário já está em uso.");
  }
  const profile: Profile = {
    id: `perfil-${username}`,
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    jobTitle: input.jobTitle?.trim() || undefined,
    username,
    passwordHash: await hashPassword(input.password),
    active: true,
  };
  profileSchema.parse(profile);
  await mutateCollection<Profile>("profiles", (rows) => [...rows, profile]);
  return profile;
}

export async function setProfileActive(id: string, active: boolean): Promise<void> {
  await mutateCollection<Profile>("profiles", (rows) =>
    rows.map((profile) => (profile.id === id ? { ...profile, active } : profile)),
  );
}
