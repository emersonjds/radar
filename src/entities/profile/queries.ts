"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfileByRole, fetchProfiles } from "./api";
import type { Role } from "./model";

export const profileKeys = {
  all: ["profiles"],
  byRole: (role: Role) => ["profiles", "role", role],
};

export function useProfiles() {
  return useQuery({ queryKey: profileKeys.all, queryFn: fetchProfiles });
}

export function useProfileByRole(role: Role) {
  return useQuery({
    queryKey: profileKeys.byRole(role),
    queryFn: () => fetchProfileByRole(role),
  });
}
