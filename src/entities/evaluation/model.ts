import { z } from "zod";

export const evaluationTypeSchema = z.enum(["exam", "homework"]);
export type EvaluationType = z.infer<typeof evaluationTypeSchema>;

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  exam: "Prova",
  homework: "Trabalho de casa",
};

export const evaluationSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  subjectId: z.string(),
  name: z.string().min(1),
  type: evaluationTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  weight: z.number().int().min(1).max(3),
});

export type Evaluation = z.infer<typeof evaluationSchema>;
