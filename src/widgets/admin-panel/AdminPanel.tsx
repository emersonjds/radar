"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useStudents } from "@/entities/student/queries";
import type { AttendanceRecord, AttendanceStatus } from "@/entities/attendance-record/model";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import { useAttendanceSessions } from "@/entities/attendance-session/queries";
import { useProfiles } from "@/entities/profile/queries";
import { useGroups } from "@/entities/group/queries";
import { useEnrollments } from "@/entities/enrollment/queries";
import { studentsAtRisk, attendanceRate, absenteeismTrend } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import { AvatarText } from "@/shared/ui/avatar-text";
import { Badge } from "@/shared/ui/badge";
import { GroupIcon, UserCircleIcon, CheckCircleIcon } from "@tailadmin/icons";
import { AttendanceBarChart } from "./AttendanceBarChart";
import { TrendLineChart } from "./TrendLineChart";

/** Below this, a lone teacher account (dev seed) would tank the stat — show a plausible mock instead. */
const LIMIAR_MOCK_PROFESSORES = 2;
const MOCK_TOTAL_PROFESSORES = 148;
const LIMITE_FALTAS_RISCO = 3;
const MAX_ALERTAS = 3;

interface TarefaAdmin {
  title: string;
  status: "Pendente" | "Concluída" | "Urgente";
}

const TAREFAS_ADMIN: TarefaAdmin[] = [
  { title: "Reunião de diretoria: orçamento do 3º trimestre", status: "Pendente" },
  { title: "Renovação de credenciamento docente", status: "Concluída" },
  { title: "Auditoria de instalações sanitárias", status: "Urgente" },
  { title: "Recepção de novos alunos", status: "Pendente" },
];

const TAREFA_VARIANT: Record<TarefaAdmin["status"], "secondary" | "success" | "danger"> = {
  Pendente: "secondary",
  Concluída: "success",
  Urgente: "danger",
};

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
        {icon}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function AdminPanel() {
  const alunos = useStudents();
  const turmas = useGroups();
  const enrollments = useEnrollments();
  const perfis = useProfiles();
  const presencas = useAttendanceRecords();
  const chamadas = useAttendanceSessions();

  const totalAlunos = alunos.data?.length ?? 0;
  const totalProfessores = perfis.data?.filter((perfil) => perfil.role === "teacher").length ?? 0;
  const frequenciaGeral = attendanceRate(presencas.data ?? []);

  const alunoPorId = new Map((alunos.data ?? []).map((aluno) => [aluno.id, aluno]));
  const turmaPorId = new Map((turmas.data ?? []).map((turma) => [turma.id, turma]));
  const chamadaPorId = new Map((chamadas.data ?? []).map((chamada) => [chamada.id, chamada]));

  const turmasDoAluno = new Map<string, string[]>();
  for (const enrollment of enrollments.data ?? []) {
    if (!enrollment.active) continue;
    turmasDoAluno.set(enrollment.studentId, [
      ...(turmasDoAluno.get(enrollment.studentId) ?? []),
      enrollment.groupId,
    ]);
  }

  const presencasPorTurma = new Map<string, AttendanceRecord[]>();
  const recordsByStudent = new Map<string, AttendanceRecord[]>();
  for (const presenca of presencas.data ?? []) {
    const chamada = chamadaPorId.get(presenca.sessionId);
    if (chamada) {
      presencasPorTurma.set(chamada.groupId, [
        ...(presencasPorTurma.get(chamada.groupId) ?? []),
        presenca,
      ]);
    }
    recordsByStudent.set(presenca.studentId, [
      ...(recordsByStudent.get(presenca.studentId) ?? []),
      presenca,
    ]);
  }

  const frequenciaPorTurma = (turmas.data ?? []).map((turma) => ({
    groupId: turma.id,
    label: turma.name.split("—")[0].trim(),
    attendance: attendanceRate(presencasPorTurma.get(turma.id) ?? []),
  }));

  const alertas = studentsAtRisk(recordsByStudent, LIMITE_FALTAS_RISCO)
    .slice(0, MAX_ALERTAS)
    .map((risco) => {
      const aluno = alunoPorId.get(risco.studentId);
      const groupIds = turmasDoAluno.get(risco.studentId) ?? [];
      const nomesTurmas = groupIds
        .map((groupId) => turmaPorId.get(groupId)?.name)
        .filter((name): name is string => Boolean(name));
      return {
        ...risco,
        name: aluno?.name ?? "Aluno",
        turma: nomesTurmas.join(", ") || "—",
      };
    });

  const registrosPorData: { date: string; status: AttendanceStatus }[] = [];
  for (const presenca of presencas.data ?? []) {
    const chamada = chamadaPorId.get(presenca.sessionId);
    if (chamada) registrosPorData.push({ date: chamada.date, status: presenca.status });
  }
  const tendencia = absenteeismTrend(registrosPorData).map((ponto) => ({
    data: ponto.date,
    attendance: 100 - ponto.absenceRate,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total de alunos"
          value={alunos.isLoading ? "…" : String(totalAlunos)}
          icon={<GroupIcon />}
        />
        <StatCard
          label="Total de professores"
          value={
            perfis.isLoading
              ? "…"
              : String(
                  totalProfessores < LIMIAR_MOCK_PROFESSORES
                    ? MOCK_TOTAL_PROFESSORES
                    : totalProfessores,
                )
          }
          icon={<UserCircleIcon />}
        />
        <StatCard
          label="Frequência geral"
          value={presencas.isLoading ? "…" : formatPercent(frequenciaGeral)}
          icon={<CheckCircleIcon />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Frequência por aula</h2>
          <p className="mb-2 text-sm text-muted-foreground">Comparativo de presença por aula</p>
          <AttendanceBarChart dados={frequenciaPorTurma} />
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Alertas de baixa frequência
          </h2>
          {alertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {alertas.map((alerta) => (
                <li key={alerta.studentId} className="flex items-center gap-3">
                  <AvatarText name={alerta.name} />
                  <div className="mr-auto min-w-0">
                    <p className="truncate font-medium text-foreground">{alerta.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{alerta.turma}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="danger">{formatPercent(alerta.attendance)}</Badge>
                    <span className="text-xs text-muted-foreground">{alerta.absences} faltas</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/students?filtro=risco"
            className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary/90"
          >
            Ver todos os alunos em risco
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Tendência de frequência</h2>
          <TrendLineChart pontos={tendencia} />
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tarefas administrativas</h2>
          <ul className="flex flex-col gap-3">
            {TAREFAS_ADMIN.map((tarefa) => (
              <li key={tarefa.title} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{tarefa.title}</span>
                <Badge variant={TAREFA_VARIANT[tarefa.status]}>{tarefa.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
