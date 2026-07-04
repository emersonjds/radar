import { fetchProfiles } from "@/entities/profile/api";
import type { Profile } from "@/entities/profile/model";
import { verifyPassword } from "@/shared/lib/auth/password";

/**
 * Demo auth over the local store: match by username (case-insensitive), require
 * an active profile, then verify the password hash. Returns the profile on
 * success, else null. Replace with Supabase Auth (server-side) later.
 */
export async function authenticate(username: string, password: string): Promise<Profile | null> {
  const alvo = username.trim().toLowerCase();
  const profiles = await fetchProfiles();
  const profile = profiles.find((candidate) => candidate.username === alvo && candidate.active);
  if (!profile) return null;
  return (await verifyPassword(password, profile.passwordHash)) ? profile : null;
}
