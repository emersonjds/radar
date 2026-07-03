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
import { Icon } from "@/shared/ui/Icon/Icon";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
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
  const [busca, setBusca] = useState("");

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

  const termoBusca = busca.trim().toLowerCase();
  const alunosFiltrados = (alunos ?? []).filter(
    (aluno) =>
      !termoBusca ||
      aluno.name.toLowerCase().includes(termoBusca) ||
      aluno.enrollment.toLowerCase().includes(termoBusca),
  );

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
        <div className={styles.tituloWrap}>
          <select
            className={styles.titulo}
            value={groupId}
            disabled={carregandoTurmas}
            onChange={(event) => setTurmaSelecionada(event.target.value)}
            aria-label="Selecionar turma"
          >
            {(turmas ?? []).map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.name} — {turma.gradeLevel}
              </option>
            ))}
          </select>
          <p className={styles.data}>
            <Icon name="calendar" size={16} />
            {formatDateLong(HOJE)}
          </p>
        </div>

        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar aluno por nome ou matrícula..."
        />

        <div className={styles.tiles}>
          {STATUS_OPTIONS.map((opcao) => (
            <div key={opcao.value} className={styles.tile}>
              <span className={cx(styles.tileLabel, styles[opcao.value])}>{opcao.label}</span>
              <span className={styles.tileValor}>{contagem[opcao.value]}</span>
            </div>
          ))}
        </div>
      </header>

      <div className={styles.toolbar}>
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
        <div className={styles.lista}>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
      )}

      {groupId && !carregandoAlunos && (alunos?.length ?? 0) === 0 && (
        <p className={styles.estadoVazio}>Turma sem alunos cadastrados.</p>
      )}

      {groupId && !carregandoAlunos && (alunos?.length ?? 0) > 0 && alunosFiltrados.length === 0 && (
        <p className={styles.estadoVazio}>Nenhum aluno encontrado para “{busca.trim()}”.</p>
      )}

      {groupId && !carregandoAlunos && alunosFiltrados.length > 0 && (
        <div className={styles.lista}>
          {alunosFiltrados.map((aluno) => (
            <StudentRow
              key={aluno.id}
              aluno={aluno}
              status={statusPorAluno[aluno.id]}
              onSelectStatus={(status) => selecionarStatus(aluno.id, status)}
            />
          ))}
        </div>
      )}

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
          fullWidth
          onClick={salvarChamada}
          disabled={salvando || !groupId || (alunos?.length ?? 0) === 0}
        >
          {salvando ? "Salvando…" : "Salvar chamada"}
        </Button>
      </div>
    </div>
  );
}
