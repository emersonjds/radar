"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  deleteGroup,
  fetchGroupById,
  fetchGroups,
  updateGroup,
  type GroupUpdate,
  type NewGroupInput,
} from "./api";

export const groupKeys = {
  all: ["groups"],
  byId: (id: string) => ["groups", id],
};

export function useGroups() {
  return useQuery({ queryKey: groupKeys.all, queryFn: fetchGroups });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.byId(id),
    queryFn: () => fetchGroupById(id),
    enabled: Boolean(id),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewGroupInput) => createGroup(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.all }),
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: GroupUpdate }) => updateGroup(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.all }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.all }),
  });
}
