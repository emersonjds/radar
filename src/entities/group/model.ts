import { z } from "zod";

export const shiftSchema = z.enum(["manhã", "afternoon", "evening"]);
export type Shift = z.infer<typeof shiftSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  shift: shiftSchema,
  teacherId: z.string(),
});

export type Group = z.infer<typeof groupSchema>;

export const shiftLabels: Record<Shift, string> = {
  manhã: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};
