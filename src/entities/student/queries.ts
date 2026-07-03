"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentById, fetchStudents, fetchStudentsByGroup } from "./api";

export const studentKeys = {
  all: ["students"],
  byGroup: (groupId: string) => ["students", "group", groupId],
  byId: (id: string) => ["students", id],
};

export function useStudents() {
  return useQuery({ queryKey: studentKeys.all, queryFn: fetchStudents });
}

export function useStudentsByGroup(groupId: string) {
  return useQuery({
    queryKey: studentKeys.byGroup(groupId),
    queryFn: () => fetchStudentsByGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.byId(id),
    queryFn: () => fetchStudentById(id),
    enabled: Boolean(id),
  });
}
