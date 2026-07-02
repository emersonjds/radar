"use client";

import { useAlunos } from "@/entities/aluno/queries";
import type { Presenca, StatusPresenca } from "@/entities/presenca/model";
import { usePresencas } from "@/entities/presenca/queries";
import { useChamadas } from "@/entities/chamada/queries";
import { usePerfis } from "@/entities/perfil/queries";
import { useTurmas } from "@/entities/turma/queries";
import { alunosEmRisco, taxaFrequencia, tendenciaAbsenteismo } from "@/features/analytics/model";
import { formatarPercentual } from "@/shared/lib/format";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Icon } from "@/shared/ui/Icon/Icon";
import { StatCard } from "@/shared/ui/StatCard/StatCard";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/ui/Table/Table";
import { BarChartFrequencia } from "./BarChartFrequencia";
import { LineChartTendencia } from "./LineChartTendencia";
import styles from "./PainelAdmin.module.css";

/** Below this, a lone teacher account (dev seed) would tank the stat — show a plausible mock instead. */
const LIMIAR_MOCK_PROFESSORES = 2;
const MOCK_TOTAL_PROFESSORES = 148;
const LIMITE_FALTAS_RISCO = 3;
const MAX_ALERTAS = 3;

interface TarefaAdmin {
  titulo: string;
  status: "Pendente" | "Concluída" | "Urgente";
}

const TAREFAS_ADMIN: TarefaAdmin[] = [
  { titulo: "Reunião de diretoria: orçamento do 3º trimestre", status: "Pendente" },
  { titulo: "Renovação de credenciamento docente", status: "Concluída" },
  { titulo: "Auditoria de instalações sanitárias", status: "Urgente" },
  { titulo: "Recepção de novos alunos", status: "Pendente" },
];

const TAREFA_TONE: Record<TarefaAdmin["status"], "neutral" | "success" | "danger"> = {
  Pendente: "neutral",
  "Concluída": "success",
  Urgente: "danger",
};

interface LoginRecente {
  nome: string;
  turma: string;
  horario: string;
  ip: string;
  status: "Sucesso" | "Falha";
}

const LOGINS_RECENTES: LoginRecente[] = [
  { nome: "Elena Rodrigues", turma: "3ª série", horario: "08:14:22", ip: "192.168.1.14", status: "Sucesso" },
  { nome: "Tobias Jenkins", turma: "2ª série", horario: "08:11:45", ip: "192.168.1.52", status: "Sucesso" },
  { nome: "Amara Gupta", turma: "1ª série", horario: "08:09:12", ip: "192.168.1.109", status: "Falha" },
];

export function PainelAdmin() {
  const alunos = useAlunos();
  const turmas = useTurmas();
  const perfis = usePerfis();
  const presencas = usePresencas();
  const chamadas = useChamadas();

  const totalAlunos = alunos.data?.length ?? 0;
  const totalProfessores = perfis.data?.filter((perfil) => perfil.papel === "professor").length ?? 0;
  const frequenciaGeral = taxaFrequencia(presencas.data ?? []);

  const alunoPorId = new Map((alunos.data ?? []).map((aluno) => [aluno.id, aluno]));
  const turmaPorId = new Map((turmas.data ?? []).map((turma) => [turma.id, turma]));
  const chamadaPorId = new Map((chamadas.data ?? []).map((chamada) => [chamada.id, chamada]));

  const presencasPorTurma = new Map<string, Presenca[]>();
  const presencasPorAluno = new Map<string, Presenca[]>();
  for (const presenca of presencas.data ?? []) {
    const aluno = alunoPorId.get(presenca.alunoId);
    if (aluno) {
      presencasPorTurma.set(aluno.turmaId, [...(presencasPorTurma.get(aluno.turmaId) ?? []), presenca]);
    }
    presencasPorAluno.set(presenca.alunoId, [...(presencasPorAluno.get(presenca.alunoId) ?? []), presenca]);
  }

  const frequenciaPorTurma = (turmas.data ?? []).map((turma) => ({
    turmaId: turma.id,
    label: turma.serie.split(" ")[0],
    frequencia: taxaFrequencia(presencasPorTurma.get(turma.id) ?? []),
  }));

  const alertas = alunosEmRisco(presencasPorAluno, LIMITE_FALTAS_RISCO)
    .slice(0, MAX_ALERTAS)
    .map((risco) => {
      const aluno = alunoPorId.get(risco.alunoId);
      const turma = aluno ? turmaPorId.get(aluno.turmaId) : undefined;
      return { ...risco, nome: aluno?.nome ?? "Aluno", turma: turma?.serie ?? "—" };
    });

  const registrosPorData: { data: string; status: StatusPresenca }[] = [];
  for (const presenca of presencas.data ?? []) {
    const chamada = chamadaPorId.get(presenca.chamadaId);
    if (chamada) registrosPorData.push({ data: chamada.data, status: presenca.status });
  }
  const tendencia = tendenciaAbsenteismo(registrosPorData).map((ponto) => ({
    data: ponto.data,
    frequencia: 100 - ponto.taxaFalta,
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
          value={presencas.isLoading ? "…" : formatarPercentual(frequenciaGeral)}
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
          <BarChartFrequencia dados={frequenciaPorTurma} />
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
                <li key={alerta.alunoId} className={styles.alertItem}>
                  <Avatar nome={alerta.nome} size={36} />
                  <div className={styles.alertInfo}>
                    <span className={styles.alertNome}>{alerta.nome}</span>
                    <span className={styles.alertTurma}>{alerta.turma}</span>
                  </div>
                  <div className={styles.alertMeta}>
                    <Badge tone="danger">{formatarPercentual(alerta.frequencia)}</Badge>
                    <span className={styles.alertFaltas}>{alerta.faltas} faltas</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className={styles.verTodos}>
            Ver todos os alunos em risco
          </button>
        </Card>
      </div>

      <div className={styles.row}>
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Tendência de frequência</h2>
          </div>
          <LineChartTendencia pontos={tendencia} />
        </Card>

        <Card className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Tarefas administrativas</h2>
          </div>
          <ul className={styles.taskList}>
            {TAREFAS_ADMIN.map((tarefa) => (
              <li key={tarefa.titulo} className={styles.taskItem}>
                <span>{tarefa.titulo}</span>
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
                <TR key={login.nome}>
                  <TD>{login.nome}</TD>
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
