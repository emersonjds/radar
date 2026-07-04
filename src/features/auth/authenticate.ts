import { fetchProfileWithHash, toPublicProfile, type PublicProfile } from "@/entities/profile/api";
import { verifyPassword } from "@/shared/lib/auth/password";

/**
 * Demo auth over the local store: match by username (case-insensitive), require
 * an active profile, then verify the password hash. Returns the profile (without
 * the hash) on success, else null. Replace with Supabase Auth (server-side) later.
 */
export async function authenticate(
  username: string,
  password: string,
): Promise<PublicProfile | null> {
  const profile = await fetchProfileWithHash(username);
  if (!profile || !profile.active) return null;
  if (!(await verifyPassword(password, profile.passwordHash))) return null;
  return toPublicProfile(profile);
}
