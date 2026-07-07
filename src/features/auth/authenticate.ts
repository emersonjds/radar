import { fetchProfiles, type PublicProfile } from "@/entities/profile/api";
import type { Role } from "@/entities/profile/model";

/**
 * Demo login: entra pelo cargo, sem senha (só para o PO testar cada papel).
 * Devolve o primeiro perfil ativo do cargo, ou null se não houver.
 * Trocar por Supabase Auth (server-side) depois.
 */
export async function loginAsRole(role: Role): Promise<PublicProfile | null> {
  const profiles = await fetchProfiles();
  return profiles.find((profile) => profile.role === role && profile.active) ?? null;
}
