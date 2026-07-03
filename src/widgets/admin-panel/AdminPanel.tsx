"use client";

import Link from "next/link";
import { useStudents } from "@/entities/student/queries";
import type { AttendanceRecord, AttendanceStatus } from "@/entities/attendance-record/model";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import { useAttendanceSessions } from "@/entities/attendance-session/queries";
import { useProfiles } from "@/entities/profile/queries";
import { useGroups } from "@/entities/group/queries";
import { studentsAtRisk, attendanceRate, absenteeismTrend } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Icon } from "@/shared/ui/Icon/Icon";
import { StatCard } from "@/shared/ui/StatCard/StatCard";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/ui/Table/Table";
import { AttendanceBarChart } from "./AttendanceBarChart";
import { TrendLineChart } from "./TrendLineChart";
import styles from "./AdminPanel.module.css";

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

const TAREFA_TONE: Record<TarefaAdmin["status"], "neutral" | "success" | "danger"> = {
  Pendente: "neutral",
  "Concluída": "success",
  Urgente: "danger",
};

interface LoginRecente {
  name: string;
  turma: string;
  horario: string;
  ip: string;
  status: "Sucesso" | "Falha";
}

const LOGINS_RECENTES: LoginRecente[] = [
  { name: "Elena Rodrigues", turma: "3ª série", horario: "08:14:22", ip: "192.168.1.14", status: "Sucesso" },
  { name: "Tobias Jenkins", turma: "2ª série", horario: "08:11:45", ip: "192.168.1.52", status: "Sucesso" },
  { name: "Amara Gupta", turma: "1ª série", horario: "08:09:12", ip: "192.168.1.109", status: "Falha" },
];

export function AdminPanel() {
  const alunos = useStudents();
  const turmas = useGroups();
  const perfis = useProfiles();
  const presencas = useAttendanceRecords();
  const chamadas = useAttendanceSessions();

  const totalAlunos = alunos.data?.length ?? 0;
  const totalProfessores = perfis.data?.filter((perfil) => perfil.role === "teacher").length ?? 0;
  const frequenciaGeral = attendanceRate(presencas.data ?? []);

  const alunoPorId = new Map((alunos.data ?? []).map((aluno) => [aluno.id, aluno]));
  const turmaPorId = new Map((turmas.data ?? []).map((turma) => [turma.id, turma]));
  const chamadaPorId = new Map((chamadas.data ?? []).map((chamada) => [chamada.id, chamada]));

  const presencasPorTurma = new Map<string, AttendanceRecord[]>();
  const recordsByStudent = new Map<string, AttendanceRecord[]>();
  for (const presenca of presencas.data ?? []) {
    const aluno = alunoPorId.get(presenca.studentId);
    if (aluno) {
      presencasPorTurma.set(aluno.groupId, [...(presencasPorTurma.get(aluno.groupId) ?? []), presenca]);
    }
    recordsByStudent.set(presenca.studentId, [...(recordsByStudent.get(presenca.studentId) ?? []), presenca]);
  }

  const frequenciaPorTurma = (turmas.data ?? []).map((turma) => ({
    groupId: turma.id,
    label: turma.gradeLevel.split(" ")[0],
    attendance: attendanceRate(presencasPorTurma.get(turma.id) ?? []),
  }));

  const alertas = studentsAtRisk(recordsByStudent, LIMITE_FALTAS_RISCO)
    .slice(0, MAX_ALERTAS)
    .map((risco) => {
      const aluno = alunoPorId.get(risco.studentId);
      const turma = aluno ? turmaPorId.get(aluno.groupId) : undefined;
      return { ...risco, name: aluno?.name ?? "Aluno", turma: turma?.gradeLevel ?? "—" };
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
    <div className={styles.page}>
      <div className={styles.stats}>
        <StatCard
          label="Total de alunos"
          value={alunos.isLoading ? "…" : String(totalAlunos)}
          icon={<Icon name="user" />}
        />
        <StatCard
          label="Total de professores"
          value={
            perfis.isLoading
              ? "…"
              : String(totalProfessores < LIMIAR_MOCK_PROFESSORES ? MOCK_TOTAL_PROFESSORES : totalProfessores)
          }
          icon={<Icon name="admin" />}
        />
        <StatCard
          label="Frequência geral"
          value={presencas.isLoading ? "…" : formatPercent(frequenciaGeral)}
          icon={<Icon name="check" />}
        />
      </div>

      <div className={styles.row}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Frequência por turma</h2>
              <p className={styles.cardSubtitle}>Comparativo de presença e ausência por turma</p>
            </div>
          </div>
          <AttendanceBarChart dados={frequenciaPorTurma} />
        </Card>

        <Card className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Icon name="alert" /> Alertas de baixa frequência
            </h2>
          </div>
          {alertas.length === 0 ? (
            <p className={styles.vazio}>Sem dados ainda.</p>
          ) : (
            <ul className={styles.alertList}>
              {alertas.map((alerta) => (
                <li key={alerta.studentId} className={styles.alertItem}>
                  <Avatar name={alerta.name} size={36} />
                  <div className={styles.alertInfo}>
                    <span className={styles.alertNome}>{alerta.name}</span>
                    <span className={styles.alertTurma}>{alerta.turma}</span>
                  </div>
                  <div className={styles.alertMeta}>
                    <Badge tone="danger">{formatPercent(alerta.attendance)}</Badge>
                    <span className={styles.alertFaltas}>{alerta.absences} faltas</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/students?filtro=risco" className={styles.verTodos}>
            Ver todos os alunos em risco
          </Link>
        </Card>
      </div>

      <div className={styles.row}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Tendência de frequência</h2>
          </div>
          <TrendLineChart pontos={tendencia} />
        </Card>

        <Card className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Tarefas administrativas</h2>
          </div>
          <ul className={styles.taskList}>
            {TAREFAS_ADMIN.map((tarefa) => (
              <li key={tarefa.title} className={styles.taskItem}>
                <span>{tarefa.title}</span>
                <Badge tone={TAREFA_TONE[tarefa.status]}>{tarefa.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Logins recentes de alunos</h2>
          <Button variant="outlined" size="sm" leftIcon={<Icon name="download" size={16} />}>
            Exportar CSV
          </Button>
        </div>
        <div className={styles.tableScroll}>
          <Table>
            <THead>
              <TR>
                <TH>Aluno</TH>
                <TH>Turma</TH>
                <TH>Horário</TH>
                <TH>IP</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {LOGINS_RECENTES.map((login) => (
                <TR key={login.name}>
                  <TD>{login.name}</TD>
                  <TD>{login.turma}</TD>
                  <TD>{login.horario}</TD>
                  <TD>{login.ip}</TD>
                  <TD>
                    <Badge tone={login.status === "Sucesso" ? "success" : "danger"}>{login.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
