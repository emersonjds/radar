"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollStudent,
  fetchEnrollments,
  fetchEnrollmentsByGroup,
  fetchEnrollmentsByStudent,
  unenrollStudent,
} from "./api";
import { studentKeys } from "@/entities/student/queries";

export const enrollmentKeys = {
  all: ["enrollments"],
  byGroup: (groupId: string) => ["enrollments", "group", groupId],
  byStudent: (studentId: string) => ["enrollments", "student", studentId],
};

export function useEnrollments() {
  return useQuery({ queryKey: enrollmentKeys.all, queryFn: fetchEnrollments });
}

export function useEnrollmentsByGroup(groupId: string) {
  return useQuery({
    queryKey: enrollmentKeys.byGroup(groupId),
    queryFn: () => fetchEnrollmentsByGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useEnrollmentsByStudent(studentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.byStudent(studentId),
    queryFn: () => fetchEnrollmentsByStudent(studentId),
    enabled: Boolean(studentId),
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: enrollStudent,
    onSuccess: (enrollment) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.byGroup(enrollment.groupId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.byStudent(enrollment.studentId) });
      queryClient.invalidateQueries({ queryKey: studentKeys.byGroup(enrollment.groupId) });
    },
  });
}

export function useUnenrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unenrollStudent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.byGroup(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.byStudent(variables.studentId) });
      queryClient.invalidateQueries({ queryKey: studentKeys.byGroup(variables.groupId) });
    },
  });
}
