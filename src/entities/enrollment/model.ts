import { z } from "zod";

export const enrollmentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  groupId: z.string(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  active: z.boolean(),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;
