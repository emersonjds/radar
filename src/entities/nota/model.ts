import { z } from "zod";

/** Nota 0–10 com uma casa decimal; null = pendente de lançamento. */
export const notaSchema = z.object({
  id: z.string(),
  avaliacaoId: z.string(),
  alunoId: z.string(),
  valor: z.number().min(0).max(10).multipleOf(0.1).nullable(),
});

export type Nota = z.infer<typeof notaSchema>;
