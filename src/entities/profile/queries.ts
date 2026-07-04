"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProfile,
  fetchProfile,
  fetchProfiles,
  setProfileActive,
  type NewProfileInput,
} from "./api";

export const profileKeys = {
  all: ["profiles"],
  byId: (id: string) => ["profiles", "id", id],
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
