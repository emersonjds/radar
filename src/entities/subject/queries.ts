"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubject,
  deleteSubject,
  fetchSubjects,
  updateSubject,
  type NewSubjectInput,
  type SubjectUpdate,
} from "./api";

export const subjectKeys = { all: ["subjects"] };

export function useSubjects() {
  return useQuery({ queryKey: subjectKeys.all, queryFn: fetchSubjects });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewSubjectInput) => createSubject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SubjectUpdate }) => updateSubject(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subjectKeys.all }),
  });
}
