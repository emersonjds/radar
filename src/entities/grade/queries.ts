"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  setGrade,
  fetchGradesByStudent,
  fetchGradesByAssessment,
} from "./api";

export const gradeKeys = {
  all: ["grades"],
  byAssessment: (assessmentId: string) =>
    ["grades", "assessment", assessmentId],
  byStudent: (studentId: string) => ["grades", "student", studentId],
};

export function useGradesByAssessment(assessmentId: string) {
  return useQuery({
    queryKey: gradeKeys.byAssessment(assessmentId),
    queryFn: () => fetchGradesByAssessment(assessmentId),
    enabled: Boolean(assessmentId),
  });
}

export function useGradesByStudent(studentId: string) {
  return useQuery({
    queryKey: gradeKeys.byStudent(studentId),
    queryFn: () => fetchGradesByStudent(studentId),
    enabled: Boolean(studentId),
  });
}

export function useSetGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setGrade,
    onSuccess: (grade) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      queryClient.invalidateQueries({
        queryKey: gradeKeys.byAssessment(grade.assessmentId),
      });
      queryClient.invalidateQueries({
        queryKey: gradeKeys.byStudent(grade.studentId),
      });
    },
  });
}
