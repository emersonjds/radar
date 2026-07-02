import { z } from "zod";

export const alunoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  matricula: z.string().min(1),
  turmaId: z.string(),
  ativo: z.boolean(),
});

export type AlunoInput = z.infer<typeof alunoSchema>;
