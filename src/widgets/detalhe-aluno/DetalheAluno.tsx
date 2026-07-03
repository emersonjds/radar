"use client";

import { useAluno } from "@/entities/aluno/queries";
import { useChamadas } from "@/entities/chamada/queries";
import type { StatusPresenca } from "@/entities/presenca/model";
import { usePresencasPorAluno } from "@/entities/presenca/queries";
import { useTurmas } from "@/entities/turma/queries";
import { contarFaltas, taxaFrequencia } from "@/features/analytics/model";
import { formatarData, formatarPercentual } from "@/shared/lib/format";
import type { BadgeProps } from "@/shared/ui/Badge/Badge";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import { Icon } from "@/shared/ui/Icon/Icon";
import { TBody, TD, TH, THead, TR, Table } from "@/shared/ui/Table/Table";
import { CalendarioPresenca } from "./CalendarioPresenca";
import styles from "./DetalheAluno.module.css";

interface AtividadeMock {
  id: string;
  atividade: string;
  categoria: string;
  nota: string;
  data: string;
  status: "no-prazo" | "atrasado" | "pendente";
}

// ponytail: sem entidade de atividades ainda — linhas mockadas só para compor a tela.
const ATIVIDADES_MOCK: AtividadeMock[] = [
  { id: "1", atividade: "Prova de Cálculo — Final", categoria: "Matemática", nota: "95/100", data: "2026-06-18", status: "no-prazo" },
  { id: "2", atividade: "Laboratório de Física — Ondas", categoria: "Física", nota: "82/100", data: "2026-06-23", status: "atrasado" },
  { id: "3", atividade: "Análise Literária — Hamlet", categoria: "Literatura", nota: "— / 100", data: "2026-06-30", status: "pendente" },
  { id: "4", atividade: "Revolução Industrial", categoria: "História", nota: "89/100", data: "2026-07-01", status: "no-prazo" },
];

const STATUS_ATIVIDADE: Record<AtividadeMock["status"], { texto: string; tone: BadgeProps["tone"] }> = {
  "no-prazo": { texto: "No prazo", tone: "success" },
  atrasado: { texto: "Atrasado", tone: "warning" },
  pendente: { texto: "Pendente", tone: "danger" },
};

/** "YYYY-MM" com mais registros de presença — mês exibido no calendário. */
function mesComMaisRegistros(datas: string[]): string | null {
  if (datas.length === 0) return null;
  const contagem = new Map<string, number>();
  for (const data of datas) {
    const mes = data.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export interface DetalheAlunoProps {
  alunoId: string;
}

export function DetalheAluno({ alunoId }: DetalheAlunoProps) {
  const { data: aluno, isLoading: carregandoAluno } = useAluno(alunoId);
  const { data: turmas } = useTurmas();
  const { data: chamadas } = useChamadas();
  const { data: presencas, isLoading: carregandoPresencas } = usePresencasPorAluno(alunoId);

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

  const turma = turmas?.find((t) => t.id === aluno.turmaId);
  const chamadaPorId = new Map((chamadas ?? []).map((chamada) => [chamada.id, chamada]));

  const statusPorData = new Map<string, StatusPresenca>();
  for (const presenca of presencas ?? []) {
    const chamada = chamadaPorId.get(presenca.chamadaId);
    if (chamada) statusPorData.set(chamada.data, presenca.status);
  }
  const mes = mesComMaisRegistros([...statusPorData.keys()]);

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
              {(turmas ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
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
          </div>
        </Card>

        <Card className={styles.calendarioCard}>
          {carregandoPresencas && <p className={styles.estado}>Carregando registros…</p>}
          {!carregandoPresencas && mes && (
            <CalendarioPresenca key={aluno.id} mes={mes} statusPorData={statusPorData} />
          )}
          {!carregandoPresencas && !mes && (
            <p className={styles.estado}>Sem registros de presença.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className={styles.tituloSecao}>Desempenho por atividade</h2>
        <div className={styles.tabelaScroll}>
          <Table>
            <THead>
              <TR>
                <TH>Atividade</TH>
                <TH>Categoria</TH>
                <TH>Nota</TH>
                <TH>Data</TH>
                <TH>Status</TH>
                <TH>Ação</TH>
              </TR>
            </THead>
            <TBody>
              {ATIVIDADES_MOCK.map((item) => (
                <TR key={item.id}>
                  <TD>{item.atividade}</TD>
                  <TD>
                    <Badge tone="info">{item.categoria}</Badge>
                  </TD>
                  <TD>{item.nota}</TD>
                  <TD>{formatarData(item.data)}</TD>
                  <TD>
                    <Badge tone={STATUS_ATIVIDADE[item.status].tone}>
                      {STATUS_ATIVIDADE[item.status].texto}
                    </Badge>
                  </TD>
                  <TD>
                    {/* ponytail: sem destino real ainda — abrirá o detalhe da atividade */}
                    <Button variant="outlined" size="sm" onClick={() => {}}>
                      Ver detalhes
                    </Button>
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
