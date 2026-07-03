import { z } from "zod";

export const avaliacaoSchema = z.object({
  id: z.string(),
  turmaId: z.string(),
  nome: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  peso: z.number().int().min(1).max(3),
  professorId: z.string(),
});

export type Avaliacao = z.infer<typeof avaliacaoSchema>;
