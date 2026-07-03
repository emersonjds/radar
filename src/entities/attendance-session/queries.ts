"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAttendanceSession,
  fetchAttendanceSessions,
  fetchAttendanceSessionsByGroup,
} from "./api";

export const attendanceSessionKeys = {
  all: ["attendanceSessions"],
  byGroup: (groupId: string) => ["attendanceSessions", "group", groupId],
};

export function useAttendanceSessions() {
  return useQuery({ queryKey: attendanceSessionKeys.all, queryFn: fetchAttendanceSessions });
}

export function useAttendanceSessionsByGroup(groupId: string) {
  return useQuery({
    queryKey: attendanceSessionKeys.byGroup(groupId),
    queryFn: () => fetchAttendanceSessionsByGroup(groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateAttendanceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAttendanceSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: attendanceSessionKeys.all });
      queryClient.invalidateQueries({
        queryKey: attendanceSessionKeys.byGroup(session.groupId),
      });
    },
  });
}
