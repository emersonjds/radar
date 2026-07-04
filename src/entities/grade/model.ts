import { z } from "zod";

export const gradeSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  subjectId: z.string(),
  // Média já agregada por matéria (0–10, uma casa). Único por (studentId, subjectId).
  score: z.number().min(0).max(10),
});

export type Grade = z.infer<typeof gradeSchema>;
