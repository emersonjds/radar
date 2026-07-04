"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/entities/profile/queries";
import type { PublicProfile } from "@/entities/profile/api";
import type { Role } from "@/entities/profile/model";
import { clearSession, useSessionProfileId } from "./session-store";

export interface Session {
  profileId: string | null;
  profile: PublicProfile | null;
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
