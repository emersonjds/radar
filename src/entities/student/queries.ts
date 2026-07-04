"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudent,
  deleteStudent,
  fetchStudentById,
  fetchStudents,
  fetchStudentsByGroup,
  updateStudent,
  type NewStudentInput,
  type StudentUpdate,
} from "./api";

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

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewStudentInput) => createStudent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: StudentUpdate }) => updateStudent(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studentKeys.all }),
  });
}
