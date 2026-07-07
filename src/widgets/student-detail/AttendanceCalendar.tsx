import { useState } from "react";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import type { SchoolEventType } from "@/entities/school-event/model";
import { formatDateLong } from "@/shared/lib/format";
import { ChevronLeftIcon } from "@tailadmin/icons";

export interface DayEvent {
  type: SchoolEventType;
  title: string;
}

export interface AttendanceCalendarProps {
  /** Month to render, "YYYY-MM". */
  mes: string;
  /** Session date (ISO) → status, for this student. */
  statusPorData: Map<string, AttendanceStatus>;
  /** Date (ISO) → important events (férias, recuperação). */
  eventosPorData?: Map<string, DayEvent[]>;
}

// Domingo-primeiro, iniciais como no Google Calendar pt-BR.
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const LABEL_STATUS: Record<AttendanceStatus, string> = {
  present: "Presente",
  late: "Atrasado",
  absent: "Ausente",
  excused: "Justificado",
};

const LABEL_EVENTO: Record<DayEvent["type"], string> = {
  vacation: "Férias",
  makeup: "Recuperação",
  event: "Evento",
};

const STATUS_BG: Record<AttendanceStatus, string> = {
  present: "bg-success-500 text-white",
  late: "bg-warning-500 text-white",
  absent: "bg-error-500 text-white",
  excused: "bg-brand-500 text-white",
};

const EVENTO_DOT: Record<DayEvent["type"], string> = {
  vacation: "bg-brand-500",
  makeup: "bg-warning-500",
  event: "bg-gray-400",
};

/** Shifts a "YYYY-MM" string by `delta` months, carrying over the year. */
function deslocarMes(mes: string, delta: number): string {
  const [ano, mesNumero] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mesNumero - 1 + delta, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

const navBtn =
  "flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100";

export function AttendanceCalendar({
  mes,
  statusPorData,
  eventosPorData,
}: AttendanceCalendarProps) {
  const [mesVisivel, setMesVisivel] = useState(mes);
  const [ano, mesNumero] = mesVisivel.split("-").map(Number);
  const mesIndex = mesNumero - 1;
  const diasNoMes = new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
  const primeiraColuna = new Date(Date.UTC(ano, mesIndex, 1)).getUTCDay();
  const tituloMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mesIndex, 1)));

  const celulasVazias = Array.from({ length: primeiraColuna });
  const dias = Array.from({ length: diasNoMes }, (_, indice) => indice + 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Resumo de presença</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={navBtn}
            aria-label="Mês anterior"
            onClick={() => setMesVisivel((atual) => deslocarMes(atual, -1))}
          >
            <ChevronLeftIcon />
          </button>
          <span className="min-w-32 text-center text-sm font-medium text-gray-700">
            {tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}
          </span>
          <button
            type="button"
            className={navBtn}
            aria-label="Próximo mês"
            onClick={() => setMesVisivel((atual) => deslocarMes(atual, 1))}
          >
            <span className="rotate-180">
              <ChevronLeftIcon />
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((inicialDia, indice) => (
          <span
            key={`${inicialDia}-${indice}`}
            className="text-xs font-medium text-gray-400"
            aria-hidden="true"
          >
            {inicialDia}
          </span>
        ))}
        {celulasVazias.map((_, indice) => (
          <span key={`vazio-${indice}`} aria-hidden="true" />
        ))}
        {dias.map((dia) => {
          const dataIso = `${ano}-${String(mesNumero).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const status = statusPorData.get(dataIso);
          const eventos = eventosPorData?.get(dataIso) ?? [];
          const partesRotulo = [
            formatDateLong(dataIso),
            status ? LABEL_STATUS[status] : "Sem aula",
            ...eventos.map((evento) => `${LABEL_EVENTO[evento.type]}: ${evento.title}`),
          ];
          const rotulo = partesRotulo.join(" — ");
          return (
            <span
              key={dataIso}
              className="flex flex-col items-center gap-0.5 py-0.5"
              title={rotulo}
              aria-label={rotulo}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  status ? STATUS_BG[status] : "text-gray-700"
                }`}
              >
                {dia}
              </span>
              {eventos.length > 0 && (
                <span className="flex gap-0.5" aria-hidden="true">
                  {eventos.slice(0, 3).map((evento, indice) => (
                    <span
                      key={`${evento.type}-${indice}`}
                      className={`h-1 w-1 rounded-full ${EVENTO_DOT[evento.type]}`}
                    />
                  ))}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-success-500" aria-hidden="true" />
          Presente
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-warning-500" aria-hidden="true" />
          Atrasado
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-error-500" aria-hidden="true" />
          Ausente
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          Férias
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-warning-500" aria-hidden="true" />
          Recuperação
        </li>
      </ul>
    </div>
  );
}
