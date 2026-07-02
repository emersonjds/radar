import { z } from "zod";

export const statusPresencaSchema = z.enum([
  "presente",
  "ausente",
  "atrasado",
  "justificado",
]);
export type StatusPresenca = z.infer<typeof statusPresencaSchema>;

export const presencaSchema = z.object({
  id: z.string(),
  chamadaId: z.string(),
  alunoId: z.string(),
  status: statusPresencaSchema,
});

export type Presenca = z.infer<typeof presencaSchema>;

/** Statuses that count as attendance for frequency math. */
export const STATUS_PRESENTE: readonly StatusPresenca[] = ["presente", "atrasado"];
