"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSubjects } from "./api";

export const subjectKeys = { all: ["subjects"] };

export function useSubjects() {
  return useQuery({ queryKey: subjectKeys.all, queryFn: fetchSubjects });
}
