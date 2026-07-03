"use client";

import { useState } from "react";
import type { Student } from "@/entities/student/model";
import { useStudentsByGroup } from "@/entities/student/queries";
import { useCreateAttendanceSession } from "@/entities/attendance-session/queries";
import type { AttendanceStatus } from "@/entities/attendance-record/model";
import { useSetAttendanceRecord, useAttendanceRecordsBySession } from "@/entities/attendance-record/queries";
import { useGroups } from "@/entities/group/queries";
import { formatDateLong } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { StudentRow, STATUS_OPTIONS } from "./StudentRow";
import styles from "./AttendanceForm.module.css";

const PROFESSOR_ID = "perfil-ricardo";
const HOJE = new Date().toISOString().slice(0, 10);

function contarPorStatus(alunos: Student[], statusPorAluno: Record<string, AttendanceStatus>) {
  const contagem: Record<AttendanceStatus, number> = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };
  for (const aluno of alunos) {
    const status = statusPorAluno[aluno.id];
    if (status) contagem[status] += 1;
  }
  return contagem;
}

export function AttendanceForm() {
  const { data: turmas, isLoading: carregandoTurmas } = useGroups();
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const groupId = turmaSelecionada ?? turmas?.[0]?.id ?? "";
  const sessionId = groupId ? `chamada-${groupId}-${HOJE}` : "";

  const { data: alunos, isLoading: carregandoAlunos } = useStudentsByGroup(groupId);
  const { data: presencas } = useAttendanceRecordsBySession(sessionId);

  const [statusPorAluno, setStatusPorAluno] = useState<Record<string, AttendanceStatus>>({});
  const [chamadaSincronizada, setChamadaSincronizada] = useState<string | null>(null);

  // Prefill local edits from the persisted presenças whenever the roll-call
  // session (turma + data) changes — adjust state during render (React's documented
  // pattern for this) instead of an effect, guarded by sessionId so it runs once per session.
  if (sessionId && presencas && chamadaSincronizada !== sessionId) {
    const prefill: Record<string, AttendanceStatus> = {};
    for (const presenca of presencas) prefill[presenca.studentId] = presenca.status;
    setStatusPorAluno(prefill);
    setChamadaSincronizada(sessionId);
  }

  const createAttendanceSession = useCreateAttendanceSession();
  const setAttendanceRecord = useSetAttendanceRecord();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const contagem = contarPorStatus(alunos ?? [], statusPorAluno);

  function selecionarStatus(studentId: string, status: AttendanceStatus) {
    setSalvo(false);
    setStatusPorAluno((prev) => ({ ...prev, [studentId]: status }));
  }

  function marcarTodosPresentes() {
    setSalvo(false);
    setStatusPorAluno((prev) => {
      const next = { ...prev };
      for (const aluno of alunos ?? []) next[aluno.id] = "present";
      return next;
    });
  }

  async function salvarChamada() {
    setErro(null);
    setSalvo(false);
    setSalvando(true);
    try {
      const chamada = await createAttendanceSession.mutateAsync({ groupId, date: HOJE, teacherId: PROFESSOR_ID });
      const lancamentos = (alunos ?? []).filter((aluno) => statusPorAluno[aluno.id]);
      await Promise.all(
        lancamentos.map((aluno) =>
          setAttendanceRecord.mutateAsync({
            sessionId: chamada.id,
            studentId: aluno.id,
            status: statusPorAluno[aluno.id],
          }),
        ),
      );
      setSalvo(true);
    } catch {
      setErro("Não foi possível salvar a chamada. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="turma-select">
              Group
            </label>
            <select
              id="turma-select"
              className={styles.select}
              value={groupId}
              disabled={carregandoTurmas}
              onChange={(event) => setTurmaSelecionada(event.target.value)}
            >
              {(turmas ?? []).map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.name} — {turma.gradeLevel}
                </option>
              ))}
            </select>
          </div>
          <span className={styles.data}>{formatDateLong(HOJE)}</span>
        </div>

        <div className={styles.resumo}>
          {STATUS_OPTIONS.map((opcao) => (
            <span key={opcao.value} className={styles.resumoItem}>
              <span className={styles.resumoValor}>{contagem[opcao.value]}</span>
              {opcao.label.toLowerCase()}
            </span>
          ))}
        </div>
      </header>

      <Card className={styles.rosterCard}>
        <div className={styles.rosterHeader}>
          <h2 className={styles.rosterTitulo}>Alunos</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={marcarTodosPresentes}
            disabled={!groupId || (alunos?.length ?? 0) === 0}
          >
            Marcar todos como presente
          </Button>
        </div>

        {!groupId && <p className={styles.estadoVazio}>Selecione uma turma para iniciar a chamada.</p>}

        {groupId && carregandoAlunos && (
          <div>
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
          </div>
        )}

        {groupId && !carregandoAlunos && (alunos?.length ?? 0) === 0 && (
          <p className={styles.estadoVazio}>Turma sem alunos cadastrados.</p>
        )}

        {groupId && !carregandoAlunos && (alunos?.length ?? 0) > 0 && (
          <div className={styles.lista}>
            {alunos?.map((aluno) => (
              <StudentRow
                key={aluno.id}
                aluno={aluno}
                status={statusPorAluno[aluno.id]}
                onSelectStatus={(status) => selecionarStatus(aluno.id, status)}
              />
            ))}
          </div>
        )}
      </Card>

      {erro && (
        <div className={cx(styles.banner, styles.bannerErro)}>
          <span>{erro}</span>
          <Button variant="outlined" size="sm" onClick={salvarChamada} disabled={salvando}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className={styles.acoes}>
        {salvo && <Badge tone="success">Chamada salva</Badge>}
        <Button
          onClick={salvarChamada}
          disabled={salvando || !groupId || (alunos?.length ?? 0) === 0}
        >
          {salvando ? "Salvando…" : "Salvar chamada"}
        </Button>
      </div>
    </div>
  );
}
