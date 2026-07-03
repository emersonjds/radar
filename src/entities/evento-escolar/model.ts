import { z } from "zod";

export const tipoEventoEscolarSchema = z.enum(["ferias", "recuperacao", "evento"]);

export const eventoEscolarSchema = z.object({
  id: z.string(),
  tipo: tipoEventoEscolarSchema,
  titulo: z.string().min(1),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
});

export type TipoEventoEscolar = z.infer<typeof tipoEventoEscolarSchema>;
export type EventoEscolar = z.infer<typeof eventoEscolarSchema>;

/** Expande um intervalo inclusivo "YYYY-MM-DD" em cada data que ele cobre. */
export function datasNoIntervalo(dataInicio: string, dataFim: string): string[] {
  const datas: string[] = [];
  const cursor = new Date(`${dataInicio}T00:00:00Z`);
  const fim = new Date(`${dataFim}T00:00:00Z`);
  while (cursor <= fim) {
    datas.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return datas;
}
