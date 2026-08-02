import { z } from "zod";

export const attendanceStatusSchema = z.enum(["present", "absent", "late", "excused"]);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const attendanceRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  studentId: z.string(),
  status: attendanceStatusSchema,
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const PRESENT_STATUSES: readonly AttendanceStatus[] = ["present", "late"];
