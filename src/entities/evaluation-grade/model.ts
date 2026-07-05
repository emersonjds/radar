import { z } from "zod";

export const evaluationGradeSchema = z.object({
  id: z.string(),
  evaluationId: z.string(),
  studentId: z.string(),
  score: z.number().min(0).max(10).nullable(), // null = pendente
});

export type EvaluationGrade = z.infer<typeof evaluationGradeSchema>;
