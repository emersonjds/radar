import { z } from "zod";

export const studentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(8, "telefone inválido"),
  active: z.boolean(),
});

export type Student = z.infer<typeof studentSchema>;
