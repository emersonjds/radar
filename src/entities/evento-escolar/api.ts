import { readCollection } from "@/shared/lib/storage/db";
import { eventoEscolarSchema, type EventoEscolar } from "./model";

export async function fetchEventosEscolares(): Promise<EventoEscolar[]> {
  const rows = await readCollection("eventosEscolares");
  return rows.map((row) => eventoEscolarSchema.parse(row));
}
