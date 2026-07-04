"use client";

import { areaLabels } from "@/entities/subject/model";
import type { ClassAcademicSummary } from "@/features/analytics/academic";
import { formatPercent, formatScore } from "@/shared/lib/format";
import Badge from "@tailadmin/components/ui/badge/Badge";

export interface ClassOverviewProps {
  escopo: string;
  totalAlunos: number;
  avgAttendance: number;
  summary: ClassAcademicSummary;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export function ClassOverview({ escopo, totalAlunos, avgAttendance, summary }: ClassOverviewProps) {
  const maiorMedia = summary.areaAffinity[0]?.average ?? 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Panorama — {escopo}</h2>
        <span className="text-sm text-gray-500">
          {totalAlunos} aluno{totalAlunos === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Frequência média" value={formatPercent(avgAttendance)} />
        <Stat label="Nota média" value={formatScore(summary.averageScore)} />
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Área forte</p>
          <p className="mt-1 text-lg font-bold text-gray-800">
            {summary.topArea ? areaLabels[summary.topArea] : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Matérias de destaque</p>
          <p className="mt-1 flex flex-wrap gap-1">
            {summary.topSubjects.length === 0 ? (
              <span className="text-sm text-gray-400">—</span>
            ) : (
              summary.topSubjects.map((item) => (
                <Badge key={item.subject.id} color="success">
                  {item.subject.name}
                </Badge>
              ))
            )}
          </p>
        </div>
      </div>

      {summary.areaAffinity.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-gray-700">Média por área</p>
          <ul className="flex flex-col gap-2">
            {summary.areaAffinity.map((item) => (
              <li key={item.area} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-gray-600">{areaLabels[item.area]}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${
                      item.average === maiorMedia ? "bg-brand-500" : "bg-brand-300"
                    }`}
                    style={{ width: `${item.average * 10}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium text-gray-800">
                  {formatScore(item.average)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
