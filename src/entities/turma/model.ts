import { z } from "zod";

export const turmaSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  serie: z.string().min(1),
  turno: z.enum(["manha", "tarde", "noite"]),
  professorId: z.string(),
});

export type TurmaInput = z.infer<typeof turmaSchema>;
