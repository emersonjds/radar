"use client";

import { useStudent } from "@/entities/student/queries";
import { useAssessmentsByGroup } from "@/entities/assessment/queries";
import { useAttendanceSessions } from "@/entities/attendance-session/queries";
import { datesInRange } from "@/entities/school-event/model";
import { useSchoolEvents } from "@/entities/school-event/queries";
import { useGradesByStudent } from "@/entities/grade/queries";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { useAttendanceRecordsByStudent } from "@/entities/attendance-record/queries";
import { useGroups } from "@/entities/group/queries";
import { countAbsences, weightedAverage, attendanceRate } from "@/features/analytics/model";
import { formatDate, formatPercent } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Icon } from "@/shared/ui/Icon/Icon";
import { TBody, TD, TH, THead, TR, Table } from "@/shared/ui/Table/Table";
import { AttendanceCalendar, type DayEvent } from "./AttendanceCalendar";
import styles from "./StudentDetail.module.css";

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
  const { data: avaliacoes } = useAssessmentsByGroup(aluno?.groupId ?? "");
  const { data: notas } = useGradesByStudent(studentId);
  const { data: eventosEscolares } = useSchoolEvents();

  if (carregandoAluno) {
    return (
      <div className={styles.pagina}>
        <p className={styles.estado}>Carregando aluno…</p>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className={styles.pagina}>
        <p className={styles.estado}>Aluno não encontrado</p>
      </div>
    );
  }

  const turma = turmas?.find((turmaCandidata) => turmaCandidata.id === aluno.groupId);
  const chamadaPorId = new Map((chamadas ?? []).map((chamada) => [chamada.id, chamada]));

  const statusPorData = new Map<string, AttendanceStatus>();
  for (const presenca of presencas ?? []) {
    const chamada = chamadaPorId.get(presenca.sessionId);
    if (chamada) statusPorData.set(chamada.date, presenca.status);
  }
  const mes = mesComMaisRegistros([...statusPorData.keys()]);
  const notaPorAvaliacao = new Map((notas ?? []).map((nota) => [nota.assessmentId, nota]));
  const media = weightedAverage(notas ?? [], avaliacoes ?? []);

  const eventosPorData = new Map<string, DayEvent[]>();
  function adicionarEvento(data: string, evento: DayEvent) {
    eventosPorData.set(data, [...(eventosPorData.get(data) ?? []), evento]);
  }
  for (const avaliacao of avaliacoes ?? []) {
    adicionarEvento(avaliacao.date, { type: "prova", title: avaliacao.name });
  }
  for (const eventoEscolar of eventosEscolares ?? []) {
    for (const data of datesInRange(eventoEscolar.startDate, eventoEscolar.endDate)) {
      adicionarEvento(data, { type: eventoEscolar.type, title: eventoEscolar.title });
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.title}>Desempenho & Presença</h1>
          <p className={styles.subtitulo}>
            Relatório acadêmico e de frequência do período atual
          </p>
        </div>
        <div className={styles.filtros}>
          <label className={styles.campoFiltro}>
            <span>Turma</span>
            <select className={styles.select} defaultValue={aluno.groupId}>
              {(turmas ?? []).map((opcaoTurma) => (
                <option key={opcaoTurma.id} value={opcaoTurma.id}>
                  {opcaoTurma.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.campoFiltro}>
            <span>Período</span>
            <select className={styles.select} defaultValue="2026-1">
              <option value="2026-1">Semestre 1 (2026)</option>
              <option value="2026-2">Semestre 2 (2026)</option>
            </select>
          </label>
          <Button
            leftIcon={<Icon name="download" size={18} />}
            // ponytail: geração real do PDF depende de um endpoint de relatório
            onClick={() => {}}
          >
            Baixar relatório PDF
          </Button>
        </div>
      </header>

      <div className={styles.grade}>
        <Card className={styles.perfilCard}>
          <div className={styles.perfilTopo}>
            <Avatar name={aluno.name} size={72} />
            <div>
              <h2 className={styles.name}>{aluno.name}</h2>
              <p className={styles.enrollment}>ID: {aluno.enrollment}</p>
              <Badge tone={aluno.active ? "success" : "danger"}>
                {aluno.active ? "ATIVO" : "INATIVO"}
              </Badge>
            </div>
          </div>

          <dl className={styles.detalhes}>
            <div>
              <dt>Turma</dt>
              <dd>{turma?.name ?? "—"}</dd>
            </div>
            <div>
              <dt>Ano letivo</dt>
              <dd>2026</dd>
            </div>
            <div>
              <dt>Sala</dt>
              <dd>Sala 12</dd>
            </div>
          </dl>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValor}>
                {formatPercent(attendanceRate(presencas ?? []))}
              </span>
              <span className={styles.statRotulo}>Frequência</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValor}>{countAbsences(presencas ?? [])}</span>
              <span className={styles.statRotulo}>Faltas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValor}>{media === null ? "—" : media.toFixed(1)}</span>
              <span className={styles.statRotulo}>Média</span>
            </div>
          </div>
        </Card>

        <Card className={styles.calendarioCard}>
          {carregandoPresencas && <p className={styles.estado}>Carregando registros…</p>}
          {!carregandoPresencas && mes && (
            <AttendanceCalendar
              key={aluno.id}
              mes={mes}
              statusPorData={statusPorData}
              eventosPorData={eventosPorData}
            />
          )}
          {!carregandoPresencas && !mes && (
            <p className={styles.estado}>Sem registros de presença.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className={styles.tituloSecao}>Desempenho por atividade</h2>
        {(avaliacoes ?? []).length === 0 && (
          <p className={styles.estado}>Sem avaliações nesta turma.</p>
        )}
        {(avaliacoes ?? []).length > 0 && (
          <div className={styles.tabelaScroll}>
            <Table>
              <THead>
                <TR>
                  <TH>Avaliação</TH>
                  <TH>Data</TH>
                  <TH>Peso</TH>
                  <TH>Nota</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {(avaliacoes ?? []).map((avaliacao) => {
                  const valor = notaPorAvaliacao.get(avaliacao.id)?.value ?? null;
                  return (
                    <TR key={avaliacao.id}>
                      <TD>{avaliacao.name}</TD>
                      <TD>{formatDate(avaliacao.date)}</TD>
                      <TD>{avaliacao.weight}</TD>
                      <TD>{valor === null ? "—" : valor.toFixed(1)}</TD>
                      <TD>
                        <Badge tone={valor === null ? "warning" : "success"}>
                          {valor === null ? "Pendente" : "Lançada"}
                        </Badge>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
