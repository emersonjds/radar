import { z } from "zod";

export const assessmentSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  weight: z.number().int().min(1).max(3),
  teacherId: z.string(),
});

export type Assessment = z.infer<typeof assessmentSchema>;
