"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStudents } from "@/entities/student/queries";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import { useGroups } from "@/entities/group/queries";
import { useSession } from "@/features/session/use-session";
import { countAbsences, attendanceRate } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Badge } from "@/shared/ui/Badge/Badge";
import buttonStyles from "@/shared/ui/Button/Button.module.css";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { Icon } from "@/shared/ui/Icon/Icon";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/ui/Table/Table";
import styles from "./StudentList.module.css";

const LIMITE_FALTAS_RISCO = 3;

export function StudentList() {
  const { role, profile, loading: carregandoSessao } = useSession();
  const { data: alunos, isLoading: carregandoAlunos } = useStudents();
  const { data: turmas, isLoading: carregandoTurmas } = useGroups();
  const { data: presencas, isLoading: carregandoPresencas } = useAttendanceRecords();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(() => searchParams.get("q") ?? "");
  const filtroRisco = searchParams.get("filtro") === "risco";

  const carregando =
    carregandoSessao || carregandoAlunos || carregandoTurmas || carregandoPresencas;
  const isProfessor = role === "teacher";

  const turmaPorId = new Map((turmas ?? []).map((turma) => [turma.id, turma]));

  const recordsByStudent = new Map<string, AttendanceRecord[]>();
  for (const presenca of presencas ?? []) {
    recordsByStudent.set(presenca.studentId, [
      ...(recordsByStudent.get(presenca.studentId) ?? []),
      presenca,
    ]);
  }

  const turmasDoProfessor = isProfessor
    ? (turmas ?? []).filter((turma) => turma.teacherId === profile?.id)
    : [];
  const turmaIdsDoProfessor = new Set(turmasDoProfessor.map((turma) => turma.id));

  const alunosDaTurma = isProfessor
    ? (alunos ?? []).filter((aluno) => turmaIdsDoProfessor.has(aluno.groupId))
    : (alunos ?? []);

  const alunosEscopo = filtroRisco
    ? alunosDaTurma.filter(
        (aluno) => countAbsences(recordsByStudent.get(aluno.id) ?? []) >= LIMITE_FALTAS_RISCO,
      )
    : alunosDaTurma;

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = termo
    ? alunosEscopo.filter(
        (aluno) =>
          aluno.name.toLowerCase().includes(termo) ||
          aluno.enrollment.toLowerCase().includes(termo),
      )
    : alunosEscopo;

  const linhas = alunosFiltrados.map((aluno) => {
    const presencasDoAluno = recordsByStudent.get(aluno.id) ?? [];
    return {
      aluno,
      turmaNome: turmaPorId.get(aluno.groupId)?.name ?? "—",
      attendance: attendanceRate(presencasDoAluno),
      absences: countAbsences(presencasDoAluno),
    };
  });

  const semTurmas = isProfessor && turmasDoProfessor.length === 0;
  const colunas = isProfessor ? 5 : 7;
  const titulo = filtroRisco ? "Alunos em risco" : isProfessor ? "Meus alunos" : "Alunos";
  const subtitulo = filtroRisco
    ? `${alunosEscopo.length} aluno${alunosEscopo.length === 1 ? "" : "s"} com ${LIMITE_FALTAS_RISCO} ou mais faltas`
    : isProfessor
      ? "Alunos das suas turmas"
      : `${alunosEscopo.length} aluno${alunosEscopo.length === 1 ? "" : "s"} cadastrados`;

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.title}>{titulo}</h1>
          <p className={styles.subtitulo}>{subtitulo}</p>
        </div>
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome ou matrícula"
          className={styles.busca}
        />
      </header>

      <Card>
        <div className={styles.tableScroll}>
          <Table>
            <THead>
              <TR>
                <TH>Aluno</TH>
                {!isProfessor && <TH>Matrícula</TH>}
                <TH>Turma</TH>
                <TH>Frequência</TH>
                <TH>Faltas</TH>
                <TH>Situação</TH>
                {!isProfessor && <TH>Ação</TH>}
              </TR>
            </THead>
            <TBody>
              {carregando && (
                <TR>
                  <TD colSpan={colunas} className={styles.estado}>
                    Carregando alunos…
                  </TD>
                </TR>
              )}
              {!carregando && semTurmas && (
                <TR>
                  <TD colSpan={colunas} className={styles.estado}>
                    Você não tem turmas atribuídas
                  </TD>
                </TR>
              )}
              {!carregando && !semTurmas && linhas.length === 0 && (
                <TR>
                  <TD colSpan={colunas} className={styles.estado}>
                    Nenhum aluno encontrado
                  </TD>
                </TR>
              )}
              {!carregando &&
                linhas.map(({ aluno, turmaNome, attendance, absences }) => {
                  const emRisco = absences >= LIMITE_FALTAS_RISCO;
                  return (
                    <TR key={aluno.id}>
                      <TD>
                        <div className={styles.alunoCell}>
                          <Avatar name={aluno.name} size={36} />
                          <span>{aluno.name}</span>
                        </div>
                      </TD>
                      {!isProfessor && <TD>{aluno.enrollment}</TD>}
                      <TD>{turmaNome}</TD>
                      <TD>{formatPercent(attendance)}</TD>
                      <TD>{absences}</TD>
                      <TD>
                        <Badge tone={emRisco ? "danger" : "success"}>
                          {emRisco ? "Em risco" : "Regular"}
                        </Badge>
                      </TD>
                      {!isProfessor && (
                        <TD>
                          <Link
                            href={"/reports/" + aluno.id}
                            className={cx(buttonStyles.button, buttonStyles.outlined, buttonStyles.sm)}
                          >
                            <Icon name="relatorios" size={16} />
                            Ver relatório
                          </Link>
                        </TD>
                      )}
                    </TR>
                  );
                })}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
