"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGrades, fetchGradesByStudent } from "./api";

export const gradeKeys = {
  all: ["grades"],
  byStudent: (studentId: string) => ["grades", "student", studentId],
};

export function useGrades() {
  return useQuery({ queryKey: gradeKeys.all, queryFn: fetchGrades });
}

export function useGradesByStudent(studentId: string) {
  return useQuery({
    queryKey: gradeKeys.byStudent(studentId),
    queryFn: () => fetchGradesByStudent(studentId),
    enabled: Boolean(studentId),
  });
}
