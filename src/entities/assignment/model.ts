import { z } from "zod";

export const assignmentSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  subjectId: z.string(),
  teacherId: z.string(),
});

export type Assignment = z.infer<typeof assignmentSchema>;
