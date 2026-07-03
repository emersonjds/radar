"use client";

import { type FormEvent, useState } from "react";
import type { Student } from "@/entities/student/model";
import { useStudentsByGroup } from "@/entities/student/queries";
import type { Assessment } from "@/entities/assessment/model";
import { useAssessmentsByGroup, useCreateAssessment } from "@/entities/assessment/queries";
import { useSetGrade, useGradesByAssessment } from "@/entities/grade/queries";
import { useGroups } from "@/entities/group/queries";
import { useSession } from "@/features/session/use-session";
import { formatDate } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { Icon } from "@/shared/ui/Icon/Icon";
import { GradeRow } from "./GradeRow";
import styles from "./AssessmentsView.module.css";

const HOJE = new Date().toISOString().slice(0, 10);
const PESOS = [1, 2, 3];

interface AvaliacaoItemProps {
  avaliacao: Assessment;
  totalAlunos: number;
  selecionada: boolean;
  onSelect: () => void;
}

function AvaliacaoItem({ avaliacao, totalAlunos, selecionada, onSelect }: AvaliacaoItemProps) {
  const { data: notas } = useGradesByAssessment(avaliacao.id);
  const lancadas = (notas ?? []).filter((nota) => nota.value !== null).length;
  return (
    <button
      type="button"
      className={cx(styles.avaliacaoItem, selecionada && styles.avaliacaoItemAtiva)}
      aria-pressed={selecionada}
      onClick={onSelect}
    >
      <div className={styles.avaliacaoTopo}>
        <span className={styles.avaliacaoNome}>{avaliacao.name}</span>
        <Badge>Peso {avaliacao.weight}</Badge>
      </div>
      <div className={styles.avaliacaoMeta}>
        <span>{formatDate(avaliacao.date)}</span>
        <span>
          {lancadas}/{totalAlunos} notas
        </span>
      </div>
    </button>
  );
}

function contarPreenchidas(notasPorAluno: Record<string, string>, alunos: Student[]): number {
  return alunos.filter((aluno) => notasPorAluno[aluno.id]?.trim()).length;
}

export function AssessmentsView() {
  const { profile } = useSession();
  const teacherId = profile?.id ?? "perfil-ricardo";

  const { data: turmas, isLoading: carregandoTurmas } = useGroups();
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const groupId = turmaSelecionada ?? turmas?.[0]?.id ?? "";

  const { data: alunos, isLoading: carregandoAlunos } = useStudentsByGroup(groupId);
  const { data: avaliacoes, isLoading: carregandoAvaliacoes } = useAssessmentsByGroup(groupId);

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string | null>(null);
  const avaliacaoValida = (avaliacoes ?? []).some((avaliacao) => avaliacao.id === avaliacaoSelecionada)
    ? avaliacaoSelecionada
    : null;
  const assessmentId = avaliacaoValida ?? avaliacoes?.[0]?.id ?? "";

  const { data: notas } = useGradesByAssessment(assessmentId);

  const [notasPorAluno, setNotasPorAluno] = useState<Record<string, string>>({});
  const [avaliacaoSincronizada, setAvaliacaoSincronizada] = useState<string | null>(null);
  const [errosPorAluno, setErrosPorAluno] = useState<Record<string, string>>({});
  const [formAberto, setFormAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaData, setNovaData] = useState(HOJE);
  const [novoPeso, setNovoPeso] = useState("1");

  const createAssessment = useCreateAssessment();
  const setGrade = useSetGrade();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  // Prefill local edits from the persisted notas whenever the selected avaliação
  // changes — adjust state during render (React's documented pattern) instead of
  // an effect, guarded by assessmentId so it runs once per avaliação.
  if (assessmentId && notas && avaliacaoSincronizada !== assessmentId) {
    const prefill: Record<string, string> = {};
    for (const nota of notas) {
      if (nota.value !== null) prefill[nota.studentId] = String(nota.value);
    }
    setNotasPorAluno(prefill);
    setErrosPorAluno({});
    setSalvo(false);
    setAvaliacaoSincronizada(assessmentId);
  }

  function selecionarTurma(id: string) {
    setTurmaSelecionada(id);
    setAvaliacaoSelecionada(null);
  }

  async function criarAvaliacaoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!novoNome.trim()) return;
    try {
      const avaliacao = await createAssessment.mutateAsync({
        groupId,
        name: novoNome.trim(),
        date: novaData,
        weight: Number(novoPeso),
        teacherId,
      });
      setAvaliacaoSelecionada(avaliacao.id);
      setNovoNome("");
      setNovaData(HOJE);
      setNovoPeso("1");
      setFormAberto(false);
    } catch {
      setErro("Não foi possível criar a avaliação. Tente novamente.");
    }
  }

  async function salvarNotas() {
    setErro(null);
    setSalvo(false);

    const alunosComNota = new Set((notas ?? []).map((nota) => nota.studentId));
    const erros: Record<string, string> = {};
    const mutacoes: Array<{ assessmentId: string; studentId: string; value: number | null }> = [];

    for (const aluno of alunos ?? []) {
      const texto = (notasPorAluno[aluno.id] ?? "").trim();
      if (texto === "") {
        if (alunosComNota.has(aluno.id)) {
          mutacoes.push({ assessmentId, studentId: aluno.id, value: null });
        }
        continue;
      }
      const valor = Number(texto.replace(",", "."));
      if (!Number.isFinite(valor) || valor < 0 || valor > 10) {
        erros[aluno.id] = "Nota deve estar entre 0 e 10";
        continue;
      }
      mutacoes.push({ assessmentId, studentId: aluno.id, value: Math.round(valor * 10) / 10 });
    }

    setErrosPorAluno(erros);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      await Promise.all(mutacoes.map((mutacao) => setGrade.mutateAsync(mutacao)));
      setSalvo(true);
    } catch {
      setErro("Não foi possível salvar as notas. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="turma-select">
            Group
          </label>
          <select
            id="turma-select"
            className={styles.select}
            value={groupId}
            disabled={carregandoTurmas}
            onChange={(event) => selecionarTurma(event.target.value)}
          >
            {(turmas ?? []).map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.name} — {turma.gradeLevel}
              </option>
            ))}
          </select>
        </div>
      </header>

      <Card className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitulo}>Avaliações</h2>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="plus" size={16} />}
            onClick={() => setFormAberto((aberto) => !aberto)}
            disabled={!groupId}
          >
            Nova avaliação
          </Button>
        </div>

        {formAberto && (
          <form className={styles.formNovaAvaliacao} onSubmit={criarAvaliacaoSubmit}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nova-avaliacao-nome">
                Nome
              </label>
              <input
                id="nova-avaliacao-nome"
                className={styles.input}
                type="text"
                required
                value={novoNome}
                onChange={(event) => setNovoNome(event.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nova-avaliacao-data">
                Data
              </label>
              <input
                id="nova-avaliacao-data"
                className={styles.input}
                type="date"
                required
                value={novaData}
                onChange={(event) => setNovaData(event.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nova-avaliacao-peso">
                Peso
              </label>
              <select
                id="nova-avaliacao-peso"
                className={styles.select}
                value={novoPeso}
                onChange={(event) => setNovoPeso(event.target.value)}
              >
                {PESOS.map((peso) => (
                  <option key={peso} value={peso}>
                    {peso}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={createAssessment.isPending}>
              Criar
            </Button>
          </form>
        )}

        {groupId && carregandoAvaliacoes && <div className={styles.skeletonRow} />}

        {groupId && !carregandoAvaliacoes && (avaliacoes?.length ?? 0) === 0 && (
          <p className={styles.estadoVazio}>Crie a primeira avaliação.</p>
        )}

        {groupId && !carregandoAvaliacoes && (avaliacoes?.length ?? 0) > 0 && (
          <div className={styles.avaliacoesLista}>
            {avaliacoes?.map((avaliacao) => (
              <AvaliacaoItem
                key={avaliacao.id}
                avaliacao={avaliacao}
                totalAlunos={alunos?.length ?? 0}
                selecionada={avaliacao.id === assessmentId}
                onSelect={() => setAvaliacaoSelecionada(avaliacao.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {assessmentId && (
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitulo}>Lançar notas</h2>
            <span className={styles.gradeColunaNota}>
              {contarPreenchidas(notasPorAluno, alunos ?? [])}/{alunos?.length ?? 0} preenchidas
            </span>
          </div>

          {carregandoAlunos && (
            <div>
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
            </div>
          )}

          {!carregandoAlunos && (alunos?.length ?? 0) === 0 && (
            <p className={styles.estadoVazio}>Turma sem alunos cadastrados.</p>
          )}

          {!carregandoAlunos && (alunos?.length ?? 0) > 0 && (
            <>
              <div className={styles.gradeLista}>
                {alunos?.map((aluno) => (
                  <GradeRow
                    key={aluno.id}
                    aluno={aluno}
                    value={notasPorAluno[aluno.id] ?? ""}
                    erro={errosPorAluno[aluno.id]}
                    onChange={(valor) => {
                      setSalvo(false);
                      setNotasPorAluno((prev) => ({ ...prev, [aluno.id]: valor }));
                    }}
                  />
                ))}
              </div>

              {erro && (
                <div className={cx(styles.banner, styles.bannerErro)}>
                  <span>{erro}</span>
                  <Button variant="outlined" size="sm" onClick={salvarNotas} disabled={salvando}>
                    Tentar novamente
                  </Button>
                </div>
              )}

              <div className={styles.acoes}>
                {salvo && <Badge tone="success">Notas salvas</Badge>}
                <Button onClick={salvarNotas} disabled={salvando}>
                  {salvando ? "Salvando…" : "Salvar notas"}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
