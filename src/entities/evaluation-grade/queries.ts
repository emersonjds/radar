"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gradeKeys } from "@/entities/grade/queries";
import {
  fetchEvaluationGradesByEvaluation,
  setEvaluationGrade,
  type SetEvaluationGradeInput,
} from "./api";

export const evaluationGradeKeys = {
  all: ["evaluationGrades"],
  byEvaluation: (evaluationId: string) => ["evaluationGrades", evaluationId],
};

export function useEvaluationGradesByEvaluation(evaluationId: string) {
  return useQuery({
    queryKey: evaluationGradeKeys.byEvaluation(evaluationId),
    queryFn: () => fetchEvaluationGradesByEvaluation(evaluationId),
    enabled: Boolean(evaluationId),
  });
}

export function useSetEvaluationGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetEvaluationGradeInput) => setEvaluationGrade(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationGradeKeys.all });
      // Per-subject analytics is derived from these grades (Task 4).
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
    },
  });
}
