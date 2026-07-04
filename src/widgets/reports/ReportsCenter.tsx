"use client";

import { useMemo, useState } from "react";
import { useStudents } from "@/entities/student/queries";
import { useGroups } from "@/entities/group/queries";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import { useGrades } from "@/entities/grade/queries";
import { useSubjects } from "@/entities/subject/queries";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import type { Grade } from "@/entities/grade/model";
import { areaLabels } from "@/entities/subject/model";
import { attendanceRate, countAbsences } from "@/features/analytics/model";
import {
  classAcademicSummary,
  overallAverage,
  studentAptitude,
} from "@/features/analytics/academic";
import { formatPercent, formatScore } from "@/shared/lib/format";
import { downloadCsv, toCsv } from "@/shared/lib/csv";
import Button from "@tailadmin/components/ui/button/Button";
import { DownloadIcon } from "@tailadmin/icons";
import { ClassOverview } from "./ClassOverview";
import { StudentsReportTable, type ReportRow } from "./StudentsReportTable";

const LIMITE_FALTAS_RISCO = 3;
const TODAS = "todas";

const control =
  "h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export function ReportsCenter() {
  const { data: alunos, isLoading: carregandoAlunos } = useStudents();
  const { data: turmas } = useGroups();
  const { data: presencas, isLoading: carregandoPresencas } = useAttendanceRecords();
  const { data: notas, isLoading: carregandoNotas } = useGrades();
  const { data: materias } = useSubjects();

  const [turmaId, setTurmaId] = useState(TODAS);
  const [periodo, setPeriodo] = useState("2026-1");

  const carregando = carregandoAlunos || carregandoPresencas || carregandoNotas;

  const dados = useMemo(() => {
    const listaAlunos = alunos ?? [];
    const listaMaterias = materias ?? [];
    const turmaPorId = new Map((turmas ?? []).map((turma) => [turma.id, turma]));

    const presencasPorAluno = new Map<string, AttendanceRecord[]>();
    for (const presenca of presencas ?? []) {
      presencasPorAluno.set(presenca.studentId, [
        ...(presencasPorAluno.get(presenca.studentId) ?? []),
        presenca,
      ]);
    }
    const notasPorAluno = new Map<string, Grade[]>();
    for (const nota of notas ?? []) {
      notasPorAluno.set(nota.studentId, [...(notasPorAluno.get(nota.studentId) ?? []), nota]);
    }

    const escopoAlunos =
      turmaId === TODAS ? listaAlunos : listaAlunos.filter((aluno) => aluno.groupId === turmaId);

    const linhas: ReportRow[] = escopoAlunos.map((aluno) => {
      const presencasDoAluno = presencasPorAluno.get(aluno.id) ?? [];
      const notasDoAluno = notasPorAluno.get(aluno.id) ?? [];
      const faltas = countAbsences(presencasDoAluno);
      return {
        id: aluno.id,
        name: aluno.name,
        turmaNome: turmaPorId.get(aluno.groupId)?.name ?? "—",
        nota: overallAverage(notasDoAluno),
        freq: attendanceRate(presencasDoAluno),
        faltas,
        aptidao: studentAptitude(notasDoAluno, listaMaterias),
        emRisco: faltas >= LIMITE_FALTAS_RISCO,
      };
    });

    const presencasEscopo = escopoAlunos.flatMap((aluno) => presencasPorAluno.get(aluno.id) ?? []);
    const notasEscopo = escopoAlunos.flatMap((aluno) => notasPorAluno.get(aluno.id) ?? []);

    return {
      linhas,
      totalAlunos: escopoAlunos.length,
      avgAttendance: attendanceRate(presencasEscopo),
      summary: classAcademicSummary(notasEscopo, listaMaterias),
    };
  }, [alunos, materias, turmas, presencas, notas, turmaId]);

  const escopoLabel =
    turmaId === TODAS
      ? "Todas as turmas"
      : (turmas ?? []).find((turma) => turma.id === turmaId)?.name ?? "Turma";

  function exportar() {
    const headers = ["Aluno", "Turma", "Nota média", "Frequência", "Faltas", "Aptidão", "Situação"];
    const linhasCsv = dados.linhas.map((linha) => [
      linha.name,
      linha.turmaNome,
      formatScore(linha.nota),
      formatPercent(linha.freq),
      linha.faltas,
      linha.aptidao ? areaLabels[linha.aptidao] : "—",
      linha.emRisco ? "Em risco" : "Regular",
    ]);
    const slug = escopoLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    downloadCsv(`relatorio-${slug}.csv`, toCsv(headers, linhasCsv));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Panorama acadêmico e de frequência por turma — clique num aluno para a ficha completa
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Turma
            <select
              aria-label="Selecionar turma"
              className={control}
              value={turmaId}
              onChange={(event) => setTurmaId(event.target.value)}
            >
              <option value={TODAS}>Todas as turmas</option>
              {(turmas ?? []).map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
            Período
            <select
              aria-label="Selecionar período"
              className={control}
              value={periodo}
              onChange={(event) => setPeriodo(event.target.value)}
            >
              <option value="2026-1">Semestre 1 (2026)</option>
              <option value="2026-2">Semestre 2 (2026)</option>
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            startIcon={<DownloadIcon />}
            disabled={dados.linhas.length === 0}
            onClick={exportar}
          >
            Exportar CSV
          </Button>
        </div>
      </header>

      <ClassOverview
        escopo={escopoLabel}
        totalAlunos={dados.totalAlunos}
        avgAttendance={dados.avgAttendance}
        summary={dados.summary}
      />

      <StudentsReportTable linhas={dados.linhas} carregando={carregando} />
    </div>
  );
}
