"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudents } from "@/entities/student/queries";
import { useGroups } from "@/entities/group/queries";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import { countAbsences, attendanceRate } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import AvatarText from "@tailadmin/components/ui/avatar/AvatarText";
import Badge from "@tailadmin/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@tailadmin/components/ui/table";
import { EyeIcon } from "@tailadmin/icons";

const LIMITE_FALTAS_RISCO = 3;
const th = "px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";
const td = "px-5 py-4 text-sm text-gray-700";

export function ReportsList() {
  const { data: alunos, isLoading: carregandoAlunos } = useStudents();
  const { data: turmas, isLoading: carregandoTurmas } = useGroups();
  const { data: presencas, isLoading: carregandoPresencas } = useAttendanceRecords();
  const [busca, setBusca] = useState("");

  const carregando = carregandoAlunos || carregandoTurmas || carregandoPresencas;

  const turmaPorId = new Map((turmas ?? []).map((turma) => [turma.id, turma]));
  const recordsByStudent = new Map<string, AttendanceRecord[]>();
  for (const presenca of presencas ?? []) {
    recordsByStudent.set(presenca.studentId, [
      ...(recordsByStudent.get(presenca.studentId) ?? []),
      presenca,
    ]);
  }

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = termo
    ? (alunos ?? []).filter(
        (aluno) =>
          aluno.name.toLowerCase().includes(termo) ||
          aluno.enrollment.toLowerCase().includes(termo),
      )
    : (alunos ?? []);

  const linhas = alunosFiltrados.map((aluno) => {
    const presencasDoAluno = recordsByStudent.get(aluno.id) ?? [];
    return {
      aluno,
      turmaNome: turmaPorId.get(aluno.groupId)?.name ?? "—",
      attendance: attendanceRate(presencasDoAluno),
      absences: countAbsences(presencasDoAluno),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Selecione um aluno para ver o relatório de desempenho e presença
          </p>
        </div>
        <input
          type="search"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou matrícula"
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-80"
        />
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50">
              <TableRow>
                <TableCell isHeader className={th}>Aluno</TableCell>
                <TableCell isHeader className={th}>Turma</TableCell>
                <TableCell isHeader className={th}>Frequência</TableCell>
                <TableCell isHeader className={th}>Faltas</TableCell>
                <TableCell isHeader className={th}>Situação</TableCell>
                <TableCell isHeader className={th}>Relatório</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando && (
                <TableRow>
                  <TableCell className={`${td} text-center text-gray-400`} colSpan={6}>
                    Carregando alunos…
                  </TableCell>
                </TableRow>
              )}
              {!carregando && linhas.length === 0 && (
                <TableRow>
                  <TableCell className={`${td} text-center text-gray-400`} colSpan={6}>
                    Nenhum aluno encontrado
                  </TableCell>
                </TableRow>
              )}
              {!carregando &&
                linhas.map(({ aluno, turmaNome, attendance, absences }) => {
                  const emRisco = absences >= LIMITE_FALTAS_RISCO;
                  return (
                    <TableRow key={aluno.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <TableCell className={td}>
                        <Link
                          href={"/reports/" + aluno.id}
                          className="flex items-center gap-3"
                          aria-label={`Abrir relatório de ${aluno.name}`}
                        >
                          <AvatarText name={aluno.name} />
                          <span className="font-medium text-gray-800">{aluno.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className={td}>{turmaNome}</TableCell>
                      <TableCell className={td}>{formatPercent(attendance)}</TableCell>
                      <TableCell className={td}>{absences}</TableCell>
                      <TableCell className={td}>
                        <Badge color={emRisco ? "error" : "success"}>
                          {emRisco ? "Em risco" : "Regular"}
                        </Badge>
                      </TableCell>
                      <TableCell className={td}>
                        <Link
                          href={"/reports/" + aluno.id}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                          aria-label={`Ver relatório de ${aluno.name}`}
                          title="Ver relatório"
                        >
                          <EyeIcon />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
