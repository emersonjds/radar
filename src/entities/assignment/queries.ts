"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  deleteAssignment,
  fetchAssignmentsByGroup,
  fetchAssignmentsByTeacher,
  updateAssignmentTeacher,
  type NewAssignmentInput,
} from "./api";

export const assignmentKeys = {
  all: ["assignments"],
  byGroup: (groupId: string) => ["assignments", "group", groupId],
  byTeacher: (teacherId: string) => ["assignments", "teacher", teacherId],
};

export function useAssignmentsByGroup(groupId: string) {
  return useQuery({
    queryKey: assignmentKeys.byGroup(groupId),
    queryFn: () => fetchAssignmentsByGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useAssignmentsByTeacher(teacherId: string) {
  return useQuery({
    queryKey: assignmentKeys.byTeacher(teacherId),
    queryFn: () => fetchAssignmentsByTeacher(teacherId),
    enabled: Boolean(teacherId),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAssignmentInput) => createAssignment(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

export function useUpdateAssignmentTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teacherId }: { id: string; teacherId: string }) =>
      updateAssignmentTeacher(id, teacherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}
