import { z } from "zod";

export const chamadaSchema = z.object({
  id: z.string(),
  turmaId: z.string(),
  data: z.string(),
  professorId: z.string(),
});

export type ChamadaInput = z.infer<typeof chamadaSchema>;
