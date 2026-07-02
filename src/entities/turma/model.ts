import { z } from "zod";

export const turnoSchema = z.enum(["manhã", "tarde", "noite"]);
export type Turno = z.infer<typeof turnoSchema>;

export const turmaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  serie: z.string(),
  turno: turnoSchema,
  professorId: z.string(),
});

export type Turma = z.infer<typeof turmaSchema>;
