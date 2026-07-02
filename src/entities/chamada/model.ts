import { z } from "zod";

/** ISO date (YYYY-MM-DD) of the class session. */
export const chamadaSchema = z.object({
  id: z.string(),
  turmaId: z.string(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  professorId: z.string(),
});

export type Chamada = z.infer<typeof chamadaSchema>;
