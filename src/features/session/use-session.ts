"use client";

import { useProfileByRole } from "@/entities/profile/queries";
import type { Role, Profile } from "@/entities/profile/model";
import { setRole, useRole } from "./session-store";

export interface Session {
  role: Role;
  profile: Profile | null;
  loading: boolean;
  switchRole: (role: Role) => void;
}

export function useSession(): Session {
  const role = useRole();
  const { data: profile, isLoading } = useProfileByRole(role);
  return {
    role,
    profile: profile ?? null,
    loading: isLoading,
    switchRole: setRole,
  };
}
