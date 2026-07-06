"use client";

import Link from "next/link";
import { areaLabels } from "@/entities/subject/model";
import type { Area } from "@/entities/subject/model";
import { formatPercent, formatScore } from "@/shared/lib/format";
import AvatarText from "@tailadmin/components/ui/avatar/AvatarText";
import Badge from "@tailadmin/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@tailadmin/components/ui/table";
import { EyeIcon } from "@tailadmin/icons";

export interface ReportRow {
  id: string;
  name: string;
  turmaNome: string;
  nota: number;
  freq: number;
  faltas: number;
  aptidao: Area | null;
  emRisco: boolean;
}

const th = "px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";
const td = "px-5 py-4 text-sm text-gray-700";

export interface StudentsReportTableProps {
  linhas: ReportRow[];
  carregando: boolean;
}

export function StudentsReportTable({ linhas, carregando }: StudentsReportTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 bg-gray-50">
            <TableRow>
              <TableCell isHeader className={th}>
                Aluno
              </TableCell>
              <TableCell isHeader className={th}>
                Aula
              </TableCell>
              <TableCell isHeader className={th}>
                Nota média
              </TableCell>
              <TableCell isHeader className={th}>
                Frequência
              </TableCell>
              <TableCell isHeader className={th}>
                Aptidão
              </TableCell>
              <TableCell isHeader className={th}>
                Situação
              </TableCell>
              <TableCell isHeader className={th}>
                Relatório
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carregando && (
              <TableRow>
                <TableCell className={`${td} text-center text-gray-400`} colSpan={7}>
                  Carregando alunos…
                </TableCell>
              </TableRow>
            )}
            {!carregando && linhas.length === 0 && (
              <TableRow>
                <TableCell className={`${td} text-center text-gray-400`} colSpan={7}>
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            )}
            {!carregando &&
              linhas.map((linha) => (
                <TableRow key={linha.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <TableCell className={td}>
                    <Link
                      href={"/reports?studentId=" + linha.id}
                      className="flex items-center gap-3"
                      aria-label={`Abrir relatório de ${linha.name}`}
                    >
                      <AvatarText name={linha.name} />
                      <span className="font-medium text-gray-800">{linha.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className={td}>{linha.turmaNome}</TableCell>
                  <TableCell className={td}>{formatScore(linha.nota)}</TableCell>
                  <TableCell className={td}>{formatPercent(linha.freq)}</TableCell>
                  <TableCell className={td}>{linha.aptidao ? areaLabels[linha.aptidao] : "—"}</TableCell>
                  <TableCell className={td}>
                    <Badge color={linha.emRisco ? "error" : "success"}>{linha.emRisco ? "Em risco" : "Regular"}</Badge>
                  </TableCell>
                  <TableCell className={td}>
                    <Link
                      href={"/reports/" + linha.id}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                      aria-label={`Ver relatório de ${linha.name}`}
                      title="Ver relatório"
                    >
                      <EyeIcon />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
