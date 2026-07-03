"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGroupById, fetchGroups } from "./api";

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
