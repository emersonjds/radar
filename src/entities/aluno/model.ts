import { z } from "zod";

export const alunoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  matricula: z.string(),
  turmaId: z.string(),
  ativo: z.boolean(),
});

export type Aluno = z.infer<typeof alunoSchema>;
