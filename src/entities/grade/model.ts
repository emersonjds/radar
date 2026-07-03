import { z } from "zod";

/** Grade 0–10 com uma casa decimal; null = pendente de lançamento. */
export const gradeSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  studentId: z.string(),
  value: z.number().min(0).max(10).multipleOf(0.1).nullable(),
});

export type Grade = z.infer<typeof gradeSchema>;
