"use client";

import Link from "next/link";
import { useTurmas } from "@/entities/turma/queries";
import { usePresencas } from "@/entities/presenca/queries";
import { taxaFrequencia } from "@/features/analytics/model";
import { formatarDataExtenso, formatarPercentual } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/Badge/Badge";
import buttonStyles from "@/shared/ui/Button/Button.module.css";
import { Card } from "@/shared/ui/Card/Card";
import { cx } from "@/shared/ui/cx";
import { Icon } from "@/shared/ui/Icon/Icon";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { StatCard } from "@/shared/ui/StatCard/StatCard";
import { Table, TBody, TD, TH, THead, TR } from "@/shared/ui/Table/Table";
import styles from "./DashboardProfessor.module.css";

/** Class-time slots — mock, cycles when there are more turmas than slots. */
const HORARIOS_MOCK = [
  { horario: "08:00 – 09:30", sala: "Lab 02", status: "Concluída" as const },
  { horario: "10:30 – 12:00", sala: "402B", status: "Em breve" as const },
  { horario: "14:00 – 15:30", sala: "305A", status: "Agendada" as const },
  { horario: "16:00 – 17:30", sala: "201", status: "Agendada" as const },
];

const STATUS_TONE = {
  Concluída: "success",
  "Em breve": "info",
  Agendada: "neutral",
} as const;

const ACESSO_RAPIDO = [
  { label: "Alunos", href: "/alunos", icon: "user" as const },
  { label: "Minhas chamadas", href: "/chamada", icon: "chamada" as const },
];

const RELATORIOS_RECENTES = [
  { nome: "Resultado_prova_final.pdf", meta: "Gerado há 2h • 4.2 MB" },
  { nome: "Frequência_semanal.xlsx", meta: "Gerado há 5h • 120 KB" },
];

export function DashboardProfessor() {
  const { data: turmas, isLoading: carregandoTurmas } = useTurmas();
  const { data: presencas, isLoading: carregandoPresencas } = usePresencas();

  const hoje = formatarDataExtenso(new Date().toISOString().slice(0, 10));
  const frequenciaMedia = carregandoPresencas
    ? "—"
    : formatarPercentual(taxaFrequencia(presencas ?? []));

  const agenda = (turmas ?? []).map((turma, index) => ({
    turma,
    ...HORARIOS_MOCK[index % HORARIOS_MOCK.length],
  }));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Bem-vindo, Prof. Ricardo</h1>
          <p className={styles.heroData}>{hoje}</p>
        </div>
        <div className={styles.proximaAula}>
          <span className={styles.proximaAulaLabel}>Próxima aula</span>
          <strong>Matemática — Turma 8A</strong>
          <span>10:30 • Sala 402B</span>
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard
          label="Aulas hoje"
          value={carregandoTurmas ? "—" : String(turmas?.length ?? 0)}
          icon={<Icon name="chamada" />}
        />
        <StatCard
          label="Frequência média"
          value={frequenciaMedia}
          deltaTone="up"
          icon={<Icon name="relatorios" />}
        />
        <StatCard
          label="Lançamentos pendentes"
          value="12"
          delta="Ação necessária"
          deltaTone="alert"
          icon={<Icon name="alert" />}
        />
      </section>

      <div className={styles.grid}>
        <Card className={styles.agendaCard}>
          <h2 className={styles.sectionTitle}>Agenda de hoje</h2>
          <div className={styles.tableScroll}>
            <Table>
              <THead>
                <TR>
                  <TH>Horário</TH>
                  <TH>Disciplina</TH>
                  <TH>Sala</TH>
                  <TH>Status</TH>
                  <TH>Ação</TH>
                </TR>
              </THead>
              <TBody>
                {agenda.map(({ turma, horario, sala, status }) => (
                  <TR key={turma.id}>
                    <TD>{horario}</TD>
                    <TD>{turma.nome}</TD>
                    <TD>{sala}</TD>
                    <TD>
                      <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                    </TD>
                    <TD>
                      {status === "Em breve" ? (
                        <Link
                          href="/chamada"
                          className={cx(buttonStyles.button, buttonStyles.primary, buttonStyles.md)}
                        >
                          Iniciar chamada
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TD>
                  </TR>
                ))}
                {agenda.length === 0 && (
                  <TR>
                    <TD colSpan={5}>
                      {carregandoTurmas ? "Carregando agenda…" : "Nenhuma turma hoje."}
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </Card>

        <div className={styles.sidebar}>
          <Card>
            <h2 className={styles.sectionTitle}>Acesso rápido</h2>
            <div className={styles.acessoGrid}>
              {ACESSO_RAPIDO.map((item) => (
                <Link key={item.href} href={item.href} className={styles.acessoTile}>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Relatórios recentes</h2>
            <ul className={styles.relatoriosLista}>
              {RELATORIOS_RECENTES.map((relatorio) => (
                <li key={relatorio.nome} className={styles.relatorioItem}>
                  <Icon name="relatorios" />
                  <div className={styles.relatorioInfo}>
                    <span className={styles.relatorioNome}>{relatorio.nome}</span>
                    <span className={styles.relatorioMeta}>{relatorio.meta}</span>
                  </div>
                  <IconButton label={`Baixar ${relatorio.nome}`}>
                    <Icon name="download" size={16} />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
