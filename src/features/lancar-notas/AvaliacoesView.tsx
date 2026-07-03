"use client";

import { type FormEvent, useState } from "react";
import type { Aluno } from "@/entities/aluno/model";
import { useAlunosPorTurma } from "@/entities/aluno/queries";
import type { Avaliacao } from "@/entities/avaliacao/model";
import { useAvaliacoesPorTurma, useCriarAvaliacao } from "@/entities/avaliacao/queries";
import { useDefinirNota, useNotasPorAvaliacao } from "@/entities/nota/queries";
import { useTurmas } from "@/entities/turma/queries";
import { useSessao } from "@/features/sessao/use-sessao";
import { formatarData } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { Icon } from "@/shared/ui/Icon/Icon";
import { NotaRow } from "./NotaRow";
import styles from "./AvaliacoesView.module.css";

const HOJE = new Date().toISOString().slice(0, 10);
const PESOS = [1, 2, 3];

interface AvaliacaoItemProps {
  avaliacao: Avaliacao;
  totalAlunos: number;
  selecionada: boolean;
  onSelecionar: () => void;
}

function AvaliacaoItem({ avaliacao, totalAlunos, selecionada, onSelecionar }: AvaliacaoItemProps) {
  const { data: notas } = useNotasPorAvaliacao(avaliacao.id);
  const lancadas = (notas ?? []).filter((nota) => nota.valor !== null).length;
  return (
    <button
      type="button"
      className={cx(styles.avaliacaoItem, selecionada && styles.avaliacaoItemAtiva)}
      aria-pressed={selecionada}
      onClick={onSelecionar}
    >
      <div className={styles.avaliacaoTopo}>
        <span className={styles.avaliacaoNome}>{avaliacao.nome}</span>
        <Badge>Peso {avaliacao.peso}</Badge>
      </div>
      <div className={styles.avaliacaoMeta}>
        <span>{formatarData(avaliacao.data)}</span>
        <span>
          {lancadas}/{totalAlunos} notas
        </span>
      </div>
    </button>
  );
}

function contarPreenchidas(notasPorAluno: Record<string, string>, alunos: Aluno[]): number {
  return alunos.filter((aluno) => notasPorAluno[aluno.id]?.trim()).length;
}

export function AvaliacoesView() {
  const { perfil } = useSessao();
  const professorId = perfil?.id ?? "perfil-ricardo";

  const { data: turmas, isLoading: carregandoTurmas } = useTurmas();
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const turmaId = turmaSelecionada ?? turmas?.[0]?.id ?? "";

  const { data: alunos, isLoading: carregandoAlunos } = useAlunosPorTurma(turmaId);
  const { data: avaliacoes, isLoading: carregandoAvaliacoes } = useAvaliacoesPorTurma(turmaId);

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string | null>(null);
  const avaliacaoValida = (avaliacoes ?? []).some((avaliacao) => avaliacao.id === avaliacaoSelecionada)
    ? avaliacaoSelecionada
    : null;
  const avaliacaoId = avaliacaoValida ?? avaliacoes?.[0]?.id ?? "";

  const { data: notas } = useNotasPorAvaliacao(avaliacaoId);

  const [notasPorAluno, setNotasPorAluno] = useState<Record<string, string>>({});
  const [avaliacaoSincronizada, setAvaliacaoSincronizada] = useState<string | null>(null);
  const [errosPorAluno, setErrosPorAluno] = useState<Record<string, string>>({});
  const [formAberto, setFormAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaData, setNovaData] = useState(HOJE);
  const [novoPeso, setNovoPeso] = useState("1");

  const criarAvaliacao = useCriarAvaliacao();
  const definirNota = useDefinirNota();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  // Prefill local edits from the persisted notas whenever the selected avaliação
  // changes — adjust state during render (React's documented pattern) instead of
  // an effect, guarded by avaliacaoId so it runs once per avaliação.
  if (avaliacaoId && notas && avaliacaoSincronizada !== avaliacaoId) {
    const prefill: Record<string, string> = {};
    for (const nota of notas) {
      if (nota.valor !== null) prefill[nota.alunoId] = String(nota.valor);
    }
    setNotasPorAluno(prefill);
    setErrosPorAluno({});
    setSalvo(false);
    setAvaliacaoSincronizada(avaliacaoId);
  }

  function selecionarTurma(id: string) {
    setTurmaSelecionada(id);
    setAvaliacaoSelecionada(null);
  }

  async function criarAvaliacaoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!novoNome.trim()) return;
    try {
      const avaliacao = await criarAvaliacao.mutateAsync({
        turmaId,
        nome: novoNome.trim(),
        data: novaData,
        peso: Number(novoPeso),
        professorId,
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

    const alunosComNota = new Set((notas ?? []).map((nota) => nota.alunoId));
    const erros: Record<string, string> = {};
    const mutacoes: Array<{ avaliacaoId: string; alunoId: string; valor: number | null }> = [];

    for (const aluno of alunos ?? []) {
      const texto = (notasPorAluno[aluno.id] ?? "").trim();
      if (texto === "") {
        if (alunosComNota.has(aluno.id)) {
          mutacoes.push({ avaliacaoId, alunoId: aluno.id, valor: null });
        }
        continue;
      }
      const valor = Number(texto.replace(",", "."));
      if (!Number.isFinite(valor) || valor < 0 || valor > 10) {
        erros[aluno.id] = "Nota deve estar entre 0 e 10";
        continue;
      }
      mutacoes.push({ avaliacaoId, alunoId: aluno.id, valor: Math.round(valor * 10) / 10 });
    }

    setErrosPorAluno(erros);
    if (Object.keys(erros).length > 0) return;

    setSalvando(true);
    try {
      await Promise.all(mutacoes.map((mutacao) => definirNota.mutateAsync(mutacao)));
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
            Turma
          </label>
          <select
            id="turma-select"
            className={styles.select}
            value={turmaId}
            disabled={carregandoTurmas}
            onChange={(event) => selecionarTurma(event.target.value)}
          >
            {(turmas ?? []).map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome} — {turma.serie}
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
            disabled={!turmaId}
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
            <Button type="submit" disabled={criarAvaliacao.isPending}>
              Criar
            </Button>
          </form>
        )}

        {turmaId && carregandoAvaliacoes && <div className={styles.skeletonRow} />}

        {turmaId && !carregandoAvaliacoes && (avaliacoes?.length ?? 0) === 0 && (
          <p className={styles.estadoVazio}>Crie a primeira avaliação.</p>
        )}

        {turmaId && !carregandoAvaliacoes && (avaliacoes?.length ?? 0) > 0 && (
          <div className={styles.avaliacoesLista}>
            {avaliacoes?.map((avaliacao) => (
              <AvaliacaoItem
                key={avaliacao.id}
                avaliacao={avaliacao}
                totalAlunos={alunos?.length ?? 0}
                selecionada={avaliacao.id === avaliacaoId}
                onSelecionar={() => setAvaliacaoSelecionada(avaliacao.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {avaliacaoId && (
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
                  <NotaRow
                    key={aluno.id}
                    aluno={aluno}
                    valor={notasPorAluno[aluno.id] ?? ""}
                    erro={errosPorAluno[aluno.id]}
                    onAlterar={(valor) => {
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
