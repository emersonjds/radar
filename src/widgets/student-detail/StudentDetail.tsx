"use client";

import { useStudent } from "@/entities/student/queries";
import { useAttendanceSessions } from "@/entities/attendance-session/queries";
import { datesInRange } from "@/entities/school-event/model";
import { useSchoolEvents } from "@/entities/school-event/queries";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { useAttendanceRecordsByStudent } from "@/entities/attendance-record/queries";
import { useGroups } from "@/entities/group/queries";
import { countAbsences, attendanceRate } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import AvatarText from "@/shared/ui/tailadmin/AvatarText";
import Badge from "@/shared/ui/tailadmin/Badge";
import Button from "@/shared/ui/tailadmin/Button";
import { DownloadIcon } from "@/shared/icons";
import { AttendanceCalendar, type DayEvent } from "./AttendanceCalendar";

const control =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

/** "YYYY-MM" com mais registros de presença — mês exibido no calendário. */
function mesComMaisRegistros(datas: string[]): string | null {
  if (datas.length === 0) return null;
  const contagem = new Map<string, number>();
  for (const data of datas) {
    const mes = data.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()].sort((mesA, mesB) => mesB[1] - mesA[1])[0][0];
}

export interface StudentDetailProps {
  studentId: string;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const { data: aluno, isLoading: carregandoAluno } = useStudent(studentId);
  const { data: turmas } = useGroups();
  const { data: chamadas } = useAttendanceSessions();
  const { data: presencas, isLoading: carregandoPresencas } = useAttendanceRecordsByStudent(studentId);
  const { data: eventosEscolares } = useSchoolEvents();

  if (carregandoAluno) {
    return <p className="text-sm text-gray-500">Carregando aluno…</p>;
  }

  if (!aluno) {
    return <p className="text-sm text-gray-500">Aluno não encontrado</p>;
  }

  const turma = turmas?.find((turmaCandidata) => turmaCandidata.id === aluno.groupId);
  const chamadaPorId = new Map((chamadas ?? []).map((chamada) => [chamada.id, chamada]));

  const statusPorData = new Map<string, AttendanceStatus>();
  for (const presenca of presencas ?? []) {
    const chamada = chamadaPorId.get(presenca.sessionId);
    if (chamada) statusPorData.set(chamada.date, presenca.status);
  }
  const mes = mesComMaisRegistros([...statusPorData.keys()]);

  const eventosPorData = new Map<string, DayEvent[]>();
  function adicionarEvento(data: string, evento: DayEvent) {
    eventosPorData.set(data, [...(eventosPorData.get(data) ?? []), evento]);
  }
  for (const eventoEscolar of eventosEscolares ?? []) {
    for (const data of datesInRange(eventoEscolar.startDate, eventoEscolar.endDate)) {
      adicionarEvento(data, { type: eventoEscolar.type, title: eventoEscolar.title });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Desempenho &amp; Presença</h1>
          <p className="mt-1 text-sm text-gray-500">
            Relatório acadêmico e de frequência do período atual
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Turma
            <select className={control} defaultValue={aluno.groupId}>
              {(turmas ?? []).map((opcaoTurma) => (
                <option key={opcaoTurma.id} value={opcaoTurma.id}>
                  {opcaoTurma.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Período
            <select className={control} defaultValue="2026-1">
              <option value="2026-1">Semestre 1 (2026)</option>
              <option value="2026-2">Semestre 2 (2026)</option>
            </select>
          </label>
          <Button
            type="button"
            startIcon={<DownloadIcon />}
            // ponytail: geração real do PDF depende de um endpoint de relatório
            onClick={() => {}}
          >
            Baixar relatório PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <div className="flex items-center gap-4">
            <AvatarText name={aluno.name} />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{aluno.name}</h2>
              <Badge color={aluno.active ? "success" : "error"}>
                {aluno.active ? "ATIVO" : "INATIVO"}
              </Badge>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Turma</dt>
              <dd className="font-medium text-gray-800">{turma?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Ano letivo</dt>
              <dd className="font-medium text-gray-800">2026</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sala</dt>
              <dd className="font-medium text-gray-800">Sala 12</dd>
            </div>
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {formatPercent(attendanceRate(presencas ?? []))}
              </p>
              <p className="text-xs text-gray-500">Frequência</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{countAbsences(presencas ?? [])}</p>
              <p className="text-xs text-gray-500">Faltas</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          {carregandoPresencas && <p className="text-sm text-gray-500">Carregando registros…</p>}
          {!carregandoPresencas && mes && (
            <AttendanceCalendar
              key={aluno.id}
              mes={mes}
              statusPorData={statusPorData}
              eventosPorData={eventosPorData}
            />
          )}
          {!carregandoPresencas && !mes && (
            <p className="text-sm text-gray-500">Sem registros de presença.</p>
          )}
        </section>
      </div>
    </div>
  );
}
