"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSchoolEvents } from "./api";

export const schoolEventKeys = {
  all: ["schoolEvents"],
};

export function useSchoolEvents() {
  return useQuery({ queryKey: schoolEventKeys.all, queryFn: fetchSchoolEvents });
}
