import { z } from "zod";

export const attendanceSessionSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  teacherId: z.string(),
});

export type AttendanceSession = z.infer<typeof attendanceSessionSchema>;
