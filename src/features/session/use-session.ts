"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/entities/profile/queries";
import type { Role, Profile } from "@/entities/profile/model";
import { clearSession, useSessionProfileId } from "./session-store";

export interface Session {
  profileId: string | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  logout: () => void;
}

export function useSession(): Session {
  const router = useRouter();
  const profileId = useSessionProfileId();
  const { data: profile, isLoading } = useProfile(profileId);

  return {
    profileId,
    profile: profile ?? null,
    role: profile?.role ?? null,
    loading: profileId !== null && isLoading,
    logout: () => {
      clearSession();
      router.push("/login");
    },
  };
}
