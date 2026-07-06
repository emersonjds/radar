"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvaluation,
  deleteEvaluation,
  fetchEvaluationsByAssignment,
  updateEvaluation,
  type EvaluationUpdate,
  type NewEvaluationInput,
} from "./api";

export const evaluationKeys = {
  all: ["evaluations"],
  byAssignment: (groupId: string, subjectId: string) => ["evaluations", groupId, subjectId],
};

export function useEvaluationsByAssignment(groupId: string, subjectId: string) {
  return useQuery({
    queryKey: evaluationKeys.byAssignment(groupId, subjectId),
    queryFn: () => fetchEvaluationsByAssignment(groupId, subjectId),
    enabled: Boolean(groupId && subjectId),
  });
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewEvaluationInput) => createEvaluation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evaluationKeys.all }),
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: EvaluationUpdate }) => updateEvaluation(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evaluationKeys.all }),
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvaluation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evaluationKeys.all }),
  });
}
