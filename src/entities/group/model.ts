import { z } from "zod";

export const shiftSchema = z.enum(["manhã", "afternoon", "evening"]);
export type Shift = z.infer<typeof shiftSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  gradeLevel: z.string(),
  shift: shiftSchema,
  teacherId: z.string(),
});

export type Group = z.infer<typeof groupSchema>;
