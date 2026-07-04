import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { hashPassword } from "@/shared/lib/auth/password";
import { profileSchema, type Profile } from "./model";

/** Profile without the credential — safe to hand to the UI layer. */
export type PublicProfile = Omit<Profile, "passwordHash">;

const MIN_PASSWORD_LENGTH = 6;

export function toPublicProfile(profile: Profile): PublicProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    jobTitle: profile.jobTitle,
    username: profile.username,
    active: profile.active,
  };
}

/** Internal: includes passwordHash. Only auth may read the hash. */
async function fetchAllProfiles(): Promise<Profile[]> {
  const rows = await readCollection("profiles");
  return rows.map((row) => profileSchema.parse(row));
}

export async function fetchProfiles(): Promise<PublicProfile[]> {
  return (await fetchAllProfiles()).map(toPublicProfile);
}

export async function fetchProfile(id: string): Promise<PublicProfile | null> {
  const profile = (await fetchAllProfiles()).find((candidate) => candidate.id === id);
  return profile ? toPublicProfile(profile) : null;
}

/** Auth-only: returns the full profile (with hash) for credential checks. */
export async function fetchProfileWithHash(username: string): Promise<Profile | null> {
  const alvo = username.trim().toLowerCase();
  return (await fetchAllProfiles()).find((candidate) => candidate.username === alvo) ?? null;
}

export interface NewProfileInput {
  name: string;
  username: string;
  email?: string;
  role: Profile["role"];
  password: string;
  jobTitle?: string;
}

/** Admin creates a profile below them. Username is unique (case-insensitive). */
export async function createProfile(input: NewProfileInput): Promise<PublicProfile> {
  const username = input.username.trim().toLowerCase();
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("Senha deve ter pelo menos 6 caracteres.");
  }
  const existing = await fetchAllProfiles();
  if (existing.some((profile) => profile.username === username)) {
    throw new Error("Nome de usuário já está em uso.");
  }
  const profile: Profile = {
    // ponytail: id derived from the unique username — fine while usernames are
    // immutable and there's no rename flow; switch to a uuid if that changes.
    id: `perfil-${username}`,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    role: input.role,
    jobTitle: input.jobTitle?.trim() || undefined,
    username,
    passwordHash: await hashPassword(input.password),
    active: true,
  };
  profileSchema.parse(profile);
  await mutateCollection<Profile>("profiles", (rows) => [...rows, profile]);
  return toPublicProfile(profile);
}

export async function setProfileActive(id: string, active: boolean): Promise<void> {
  await mutateCollection<Profile>("profiles", (rows) =>
    rows.map((profile) => (profile.id === id ? { ...profile, active } : profile)),
  );
}

export async function deleteProfile(id: string): Promise<void> {
  await mutateCollection<Profile>("profiles", (rows) => rows.filter((profile) => profile.id !== id));
}
