"use client";

import { useState } from "react";
import type { Aluno } from "@/entities/aluno/model";
import { useAlunosPorTurma } from "@/entities/aluno/queries";
import { useCriarChamada } from "@/entities/chamada/queries";
import type { StatusPresenca } from "@/entities/presenca/model";
import { useDefinirPresenca, usePresencasPorChamada } from "@/entities/presenca/queries";
import { useTurmas } from "@/entities/turma/queries";
import { formatarDataExtenso } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { AlunoRow, OPCOES_STATUS } from "./AlunoRow";
import styles from "./ChamadaForm.module.css";

const PROFESSOR_ID = "perfil-ricardo";
const HOJE = new Date().toISOString().slice(0, 10);

function contarPorStatus(alunos: Aluno[], statusPorAluno: Record<string, StatusPresenca>) {
  const contagem: Record<StatusPresenca, number> = {
    presente: 0,
    ausente: 0,
    atrasado: 0,
    justificado: 0,
  };
  for (const aluno of alunos) {
    const status = statusPorAluno[aluno.id];
    if (status) contagem[status] += 1;
  }
  return contagem;
}

export function ChamadaForm() {
  const { data: turmas, isLoading: carregandoTurmas } = useTurmas();
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const turmaId = turmaSelecionada ?? turmas?.[0]?.id ?? "";
  const chamadaId = turmaId ? `chamada-${turmaId}-${HOJE}` : "";

  const { data: alunos, isLoading: carregandoAlunos } = useAlunosPorTurma(turmaId);
  const { data: presencas } = usePresencasPorChamada(chamadaId);

  const [statusPorAluno, setStatusPorAluno] = useState<Record<string, StatusPresenca>>({});
  const [chamadaSincronizada, setChamadaSincronizada] = useState<string | null>(null);

  // Prefill local edits from the persisted presenças whenever the roll-call
  // session (turma + data) changes — adjust state during render (React's documented
  // pattern for this) instead of an effect, guarded by chamadaId so it runs once per session.
  if (chamadaId && presencas && chamadaSincronizada !== chamadaId) {
    const prefill: Record<string, StatusPresenca> = {};
    for (const presenca of presencas) prefill[presenca.alunoId] = presenca.status;
    setStatusPorAluno(prefill);
    setChamadaSincronizada(chamadaId);
  }

  const criarChamada = useCriarChamada();
  const definirPresenca = useDefinirPresenca();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const contagem = contarPorStatus(alunos ?? [], statusPorAluno);

  function selecionarStatus(alunoId: string, status: StatusPresenca) {
    setSalvo(false);
    setStatusPorAluno((prev) => ({ ...prev, [alunoId]: status }));
  }

  function marcarTodosPresentes() {
    setSalvo(false);
    setStatusPorAluno((prev) => {
      const next = { ...prev };
      for (const aluno of alunos ?? []) next[aluno.id] = "presente";
      return next;
    });
  }

  async function salvarChamada() {
    setErro(null);
    setSalvo(false);
    setSalvando(true);
    try {
      const chamada = await criarChamada.mutateAsync({ turmaId, data: HOJE, professorId: PROFESSOR_ID });
      const lancamentos = (alunos ?? []).filter((aluno) => statusPorAluno[aluno.id]);
      await Promise.all(
        lancamentos.map((aluno) =>
          definirPresenca.mutateAsync({
            chamadaId: chamada.id,
            alunoId: aluno.id,
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
              Turma
            </label>
            <select
              id="turma-select"
              className={styles.select}
              value={turmaId}
              disabled={carregandoTurmas}
              onChange={(event) => setTurmaSelecionada(event.target.value)}
            >
              {(turmas ?? []).map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} — {turma.serie}
                </option>
              ))}
            </select>
          </div>
          <span className={styles.data}>{formatarDataExtenso(HOJE)}</span>
        </div>

        <div className={styles.resumo}>
          {OPCOES_STATUS.map((opcao) => (
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
            disabled={!turmaId || (alunos?.length ?? 0) === 0}
          >
            Marcar todos como presente
          </Button>
        </div>

        {!turmaId && <p className={styles.estadoVazio}>Selecione uma turma para iniciar a chamada.</p>}

        {turmaId && carregandoAlunos && (
          <div>
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
            <div className={styles.skeletonRow} />
          </div>
        )}

        {turmaId && !carregandoAlunos && (alunos?.length ?? 0) === 0 && (
          <p className={styles.estadoVazio}>Turma sem alunos cadastrados.</p>
        )}

        {turmaId && !carregandoAlunos && (alunos?.length ?? 0) > 0 && (
          <div className={styles.lista}>
            {alunos?.map((aluno) => (
              <AlunoRow
                key={aluno.id}
                aluno={aluno}
                status={statusPorAluno[aluno.id]}
                onSelecionarStatus={(status) => selecionarStatus(aluno.id, status)}
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
          disabled={salvando || !turmaId || (alunos?.length ?? 0) === 0}
        >
          {salvando ? "Salvando…" : "Salvar chamada"}
        </Button>
      </div>
    </div>
  );
}
