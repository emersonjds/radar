"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStudents, useDeleteStudent } from "@/entities/student/queries";
import type { Student } from "@/entities/student/model";
import type { AttendanceRecord } from "@/entities/attendance-record/model";
import { useAttendanceRecords } from "@/entities/attendance-record/queries";
import { useGroups } from "@/entities/group/queries";
import { useSession } from "@/features/session/use-session";
import { countAbsences, attendanceRate } from "@/features/analytics/model";
import { formatPercent } from "@/shared/lib/format";
import AvatarText from "@tailadmin/components/ui/avatar/AvatarText";
import Badge from "@tailadmin/components/ui/badge/Badge";
import Button from "@tailadmin/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@tailadmin/components/ui/table";
import { EyeIcon, PencilIcon, PlusIcon, TrashBinIcon } from "@tailadmin/icons";
import { StudentFormModal } from "./StudentFormModal";

const LIMITE_FALTAS_RISCO = 3;

const th = "px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";
const td = "px-5 py-4 text-sm text-gray-700";
const acaoBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100";

export function StudentList() {
  const { role, profile, loading: carregandoSessao } = useSession();
  const { data: alunos, isLoading: carregandoAlunos } = useStudents();
  const { data: turmas, isLoading: carregandoTurmas } = useGroups();
  const { data: presencas, isLoading: carregandoPresencas } = useAttendanceRecords();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(() => searchParams.get("q") ?? "");
  const filtroRisco = searchParams.get("filtro") === "risco";

  // undefined = fechado, null = novo aluno, Student = editando.
  const [formAluno, setFormAluno] = useState<Student | null | undefined>(undefined);
  const deleteStudent = useDeleteStudent();

  const carregando =
    carregandoSessao || carregandoAlunos || carregandoTurmas || carregandoPresencas;
  const isProfessor = role === "teacher";

  const turmaPorId = new Map((turmas ?? []).map((turma) => [turma.id, turma]));

  const recordsByStudent = new Map<string, AttendanceRecord[]>();
  for (const presenca of presencas ?? []) {
    recordsByStudent.set(presenca.studentId, [
      ...(recordsByStudent.get(presenca.studentId) ?? []),
      presenca,
    ]);
  }

  const turmasDoProfessor = isProfessor
    ? (turmas ?? []).filter((turma) => turma.teacherId === profile?.id)
    : [];
  const turmaIdsDoProfessor = new Set(turmasDoProfessor.map((turma) => turma.id));

  const alunosDaTurma = isProfessor
    ? (alunos ?? []).filter((aluno) => turmaIdsDoProfessor.has(aluno.groupId))
    : (alunos ?? []);

  const alunosEscopo = filtroRisco
    ? alunosDaTurma.filter(
        (aluno) => countAbsences(recordsByStudent.get(aluno.id) ?? []) >= LIMITE_FALTAS_RISCO,
      )
    : alunosDaTurma;

  const termo = busca.trim().toLowerCase();
  const alunosFiltrados = termo
    ? alunosEscopo.filter(
        (aluno) =>
          aluno.name.toLowerCase().includes(termo) ||
          aluno.enrollment.toLowerCase().includes(termo),
      )
    : alunosEscopo;

  const linhas = alunosFiltrados.map((aluno) => {
    const presencasDoAluno = recordsByStudent.get(aluno.id) ?? [];
    return {
      aluno,
      turmaNome: turmaPorId.get(aluno.groupId)?.name ?? "—",
      attendance: attendanceRate(presencasDoAluno),
      absences: countAbsences(presencasDoAluno),
    };
  });

  const semTurmas = isProfessor && turmasDoProfessor.length === 0;
  const colunas = isProfessor ? 5 : 7;
  const titulo = filtroRisco ? "Alunos em risco" : isProfessor ? "Meus alunos" : "Alunos";
  const subtitulo = filtroRisco
    ? `${alunosEscopo.length} aluno${alunosEscopo.length === 1 ? "" : "s"} com ${LIMITE_FALTAS_RISCO} ou mais faltas`
    : isProfessor
      ? "Alunos das suas turmas"
      : `${alunosEscopo.length} aluno${alunosEscopo.length === 1 ? "" : "s"} cadastrados`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{titulo}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitulo}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou matrícula"
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-80"
          />
          {!isProfessor && (
            <Button
              className="h-11"
              startIcon={<PlusIcon />}
              onClick={() => setFormAluno(null)}
            >
              Adicionar aluno
            </Button>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50">
              <TableRow>
                <TableCell isHeader className={th}>Aluno</TableCell>
                {!isProfessor && <TableCell isHeader className={th}>Matrícula</TableCell>}
                <TableCell isHeader className={th}>Turma</TableCell>
                <TableCell isHeader className={th}>Frequência</TableCell>
                <TableCell isHeader className={th}>Faltas</TableCell>
                <TableCell isHeader className={th}>Situação</TableCell>
                {!isProfessor && <TableCell isHeader className={th}>Ação</TableCell>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando && (
                <TableRow>
                  <TableCell className={`${td} text-center text-gray-400`} colSpan={colunas}>
                    Carregando alunos…
                  </TableCell>
                </TableRow>
              )}
              {!carregando && semTurmas && (
                <TableRow>
                  <TableCell className={`${td} text-center text-gray-400`} colSpan={colunas}>
                    Você não tem turmas atribuídas
                  </TableCell>
                </TableRow>
              )}
              {!carregando && !semTurmas && linhas.length === 0 && (
                <TableRow>
                  <TableCell className={`${td} text-center text-gray-400`} colSpan={colunas}>
                    Nenhum aluno encontrado
                  </TableCell>
                </TableRow>
              )}
              {!carregando &&
                linhas.map(({ aluno, turmaNome, attendance, absences }) => {
                  const emRisco = absences >= LIMITE_FALTAS_RISCO;
                  return (
                    <TableRow key={aluno.id} className="border-t border-gray-100">
                      <TableCell className={td}>
                        <div className="flex items-center gap-3">
                          <AvatarText name={aluno.name} />
                          <span className="font-medium text-gray-800">{aluno.name}</span>
                        </div>
                      </TableCell>
                      {!isProfessor && <TableCell className={td}>{aluno.enrollment}</TableCell>}
                      <TableCell className={td}>{turmaNome}</TableCell>
                      <TableCell className={td}>{formatPercent(attendance)}</TableCell>
                      <TableCell className={td}>{absences}</TableCell>
                      <TableCell className={td}>
                        <Badge color={emRisco ? "error" : "success"}>
                          {emRisco ? "Em risco" : "Regular"}
                        </Badge>
                      </TableCell>
                      {!isProfessor && (
                        <TableCell className={td}>
                          <div className="flex items-center gap-1">
                            <Link
                              href={"/reports/" + aluno.id}
                              className={acaoBtn}
                              aria-label={`Ver relatório de ${aluno.name}`}
                              title="Ver relatório"
                            >
                              <EyeIcon />
                            </Link>
                            <button
                              type="button"
                              className={acaoBtn}
                              aria-label={`Editar ${aluno.name}`}
                              title="Editar"
                              onClick={() => setFormAluno(aluno)}
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className={`${acaoBtn} hover:bg-error-50 hover:text-error-600`}
                              aria-label={`Excluir ${aluno.name}`}
                              title="Excluir"
                              disabled={deleteStudent.isPending}
                              onClick={() => {
                                if (window.confirm(`Excluir o aluno ${aluno.name}?`)) {
                                  deleteStudent.mutate(aluno.id);
                                }
                              }}
                            >
                              <TrashBinIcon />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentFormModal
        student={formAluno}
        groups={turmas ?? []}
        onClose={() => setFormAluno(undefined)}
      />
    </div>
  );
}
