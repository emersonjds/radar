"use client";

import { useAluno } from "@/entities/aluno/queries";
import { useAvaliacoesPorTurma } from "@/entities/avaliacao/queries";
import { useChamadas } from "@/entities/chamada/queries";
import { datasNoIntervalo } from "@/entities/evento-escolar/model";
import { useEventosEscolares } from "@/entities/evento-escolar/queries";
import { useNotasPorAluno } from "@/entities/nota/queries";
import type { StatusPresenca } from "@/entities/presenca/model";
import { usePresencasPorAluno } from "@/entities/presenca/queries";
import { useTurmas } from "@/entities/turma/queries";
import { contarFaltas, mediaPonderada, taxaFrequencia } from "@/features/analytics/model";
import { formatarData, formatarPercentual } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Icon } from "@/shared/ui/Icon/Icon";
import { TBody, TD, TH, THead, TR, Table } from "@/shared/ui/Table/Table";
import { CalendarioPresenca, type EventoDoDia } from "./CalendarioPresenca";
import styles from "./DetalheAluno.module.css";

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

export interface DetalheAlunoProps {
  alunoId: string;
}

export function DetalheAluno({ alunoId }: DetalheAlunoProps) {
  const { data: aluno, isLoading: carregandoAluno } = useAluno(alunoId);
  const { data: turmas } = useTurmas();
  const { data: chamadas } = useChamadas();
  const { data: presencas, isLoading: carregandoPresencas } = usePresencasPorAluno(alunoId);
  const { data: avaliacoes } = useAvaliacoesPorTurma(aluno?.turmaId ?? "");
  const { data: notas } = useNotasPorAluno(alunoId);
  const { data: eventosEscolares } = useEventosEscolares();

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

  const turma = turmas?.find((turmaCandidata) => turmaCandidata.id === aluno.turmaId);
  const chamadaPorId = new Map((chamadas ?? []).map((chamada) => [chamada.id, chamada]));

  const statusPorData = new Map<string, StatusPresenca>();
  for (const presenca of presencas ?? []) {
    const chamada = chamadaPorId.get(presenca.chamadaId);
    if (chamada) statusPorData.set(chamada.data, presenca.status);
  }
  const mes = mesComMaisRegistros([...statusPorData.keys()]);
  const notaPorAvaliacao = new Map((notas ?? []).map((nota) => [nota.avaliacaoId, nota]));
  const media = mediaPonderada(notas ?? [], avaliacoes ?? []);

  const eventosPorData = new Map<string, EventoDoDia[]>();
  function adicionarEvento(data: string, evento: EventoDoDia) {
    eventosPorData.set(data, [...(eventosPorData.get(data) ?? []), evento]);
  }
  for (const avaliacao of avaliacoes ?? []) {
    adicionarEvento(avaliacao.data, { tipo: "prova", titulo: avaliacao.nome });
  }
  for (const eventoEscolar of eventosEscolares ?? []) {
    for (const data of datasNoIntervalo(eventoEscolar.dataInicio, eventoEscolar.dataFim)) {
      adicionarEvento(data, { tipo: eventoEscolar.tipo, titulo: eventoEscolar.titulo });
    }
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Desempenho & Presença</h1>
          <p className={styles.subtitulo}>
            Relatório acadêmico e de frequência do período atual
          </p>
        </div>
        <div className={styles.filtros}>
          <label className={styles.campoFiltro}>
            <span>Turma</span>
            <select className={styles.select} defaultValue={aluno.turmaId}>
              {(turmas ?? []).map((opcaoTurma) => (
                <option key={opcaoTurma.id} value={opcaoTurma.id}>
                  {opcaoTurma.nome}
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
            <Avatar nome={aluno.nome} size={72} />
            <div>
              <h2 className={styles.nome}>{aluno.nome}</h2>
              <p className={styles.matricula}>ID: {aluno.matricula}</p>
              <Badge tone={aluno.ativo ? "success" : "danger"}>
                {aluno.ativo ? "ATIVO" : "INATIVO"}
              </Badge>
            </div>
          </div>

          <dl className={styles.detalhes}>
            <div>
              <dt>Turma</dt>
              <dd>{turma?.nome ?? "—"}</dd>
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
                {formatarPercentual(taxaFrequencia(presencas ?? []))}
              </span>
              <span className={styles.statRotulo}>Frequência</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValor}>{contarFaltas(presencas ?? [])}</span>
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
            <CalendarioPresenca
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
                  const valor = notaPorAvaliacao.get(avaliacao.id)?.valor ?? null;
                  return (
                    <TR key={avaliacao.id}>
                      <TD>{avaliacao.nome}</TD>
                      <TD>{formatarData(avaliacao.data)}</TD>
                      <TD>{avaliacao.peso}</TD>
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
