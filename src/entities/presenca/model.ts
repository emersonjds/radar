import { z } from "zod";

export const statusPresencaSchema = z.enum(["presente", "ausente", "atrasado", "justificado"]);

export const presencaSchema = z.object({
  id: z.string(),
  chamadaId: z.string(),
  alunoId: z.string(),
  status: statusPresencaSchema,
});

export type PresencaInput = z.infer<typeof presencaSchema>;
