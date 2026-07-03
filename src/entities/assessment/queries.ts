"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createAssessment, fetchAssessmentsByGroup } from "./api";

export const assessmentKeys = {
  all: ["assessments"],
  byGroup: (groupId: string) => ["assessments", "group", groupId],
};

export function useAssessmentsByGroup(groupId: string) {
  return useQuery({
    queryKey: assessmentKeys.byGroup(groupId),
    queryFn: () => fetchAssessmentsByGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssessment,
    onSuccess: (assessment) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: assessmentKeys.byGroup(assessment.groupId),
      });
    },
  });
}
