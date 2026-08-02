"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  setAttendanceRecord,
  fetchAttendanceRecords,
  fetchAttendanceRecordsByStudent,
  fetchAttendanceRecordsBySession,
} from "./api";

export const attendanceRecordKeys = {
  all: ["attendanceRecords"],
  bySession: (sessionId: string) => ["attendanceRecords", "session", sessionId],
  byStudent: (studentId: string) => ["attendanceRecords", "student", studentId],
};

export function useAttendanceRecords() {
  return useQuery({ queryKey: attendanceRecordKeys.all, queryFn: fetchAttendanceRecords });
}

export function useAttendanceRecordsBySession(sessionId: string) {
  return useQuery({
    queryKey: attendanceRecordKeys.bySession(sessionId),
    queryFn: () => fetchAttendanceRecordsBySession(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useAttendanceRecordsByStudent(studentId: string) {
  return useQuery({
    queryKey: attendanceRecordKeys.byStudent(studentId),
    queryFn: () => fetchAttendanceRecordsByStudent(studentId),
    enabled: Boolean(studentId),
  });
}

export function useSetAttendanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAttendanceRecord,
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: attendanceRecordKeys.all });
      queryClient.invalidateQueries({
        queryKey: attendanceRecordKeys.bySession(record.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceRecordKeys.byStudent(record.studentId),
      });
    },
  });
}
