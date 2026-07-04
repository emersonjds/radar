"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProfile,
  fetchProfile,
  fetchProfileByRole,
  fetchProfiles,
  setProfileActive,
  type NewProfileInput,
} from "./api";
import type { Role } from "./model";

export const profileKeys = {
  all: ["profiles"],
  byId: (id: string) => ["profiles", "id", id],
  byRole: (role: Role) => ["profiles", "role", role],
};

export function useProfiles() {
  return useQuery({ queryKey: profileKeys.all, queryFn: fetchProfiles });
}

export function useProfile(id: string | null) {
  return useQuery({
    queryKey: profileKeys.byId(id ?? ""),
    queryFn: () => (id ? fetchProfile(id) : Promise.resolve(null)),
    enabled: id !== null,
  });
}

export function useProfileByRole(role: Role) {
  return useQuery({
    queryKey: profileKeys.byRole(role),
    queryFn: () => fetchProfileByRole(role),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewProfileInput) => createProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  });
}

export function useSetProfileActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setProfileActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  });
}
