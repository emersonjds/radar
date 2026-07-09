"use client";

import { areaLabels } from "@/entities/subject/model";
import type { Grade } from "@/entities/grade/model";
import type { Subject } from "@/entities/subject/model";
import {
  areaAffinity,
  averageBySubject,
  overallAverage,
  studentAptitude,
} from "@/features/analytics/academic";
import { formatScore } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";

export interface AcademicPanelProps {
  grades: Grade[];
  subjects: Subject[];
}

function Bar({ label, value, forte }: { label: string; value: number; forte: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-sm text-gray-600">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${forte ? "bg-brand-500" : "bg-brand-300"}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-medium text-gray-800">
        {formatScore(value)}
      </span>
    </li>
  );
}

export function AcademicPanel({ grades, subjects }: AcademicPanelProps) {
  if (grades.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-800">Desempenho acadêmico</h2>
        <p className="mt-2 text-sm text-gray-500">Sem notas lançadas.</p>
      </section>
    );
  }

  const nota = overallAverage(grades);
  const aptidao = studentAptitude(grades, subjects);
  const areas = areaAffinity(grades, subjects);
  const materias = averageBySubject(grades, subjects);
  const maiorArea = areas[0]?.average ?? 0;
  const maiorMateria = materias[0]?.score ?? 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Desempenho acadêmico</h2>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Nota geral</p>
            <p className="text-xl font-bold text-gray-800">{formatScore(nota)}</p>
          </div>
          {aptidao && <Badge variant="success">Aptidão: {areaLabels[aptidao]}</Badge>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Notas por matéria</p>
          <ul className="flex flex-col gap-2">
            {materias.map((item) => (
              <Bar
                key={item.subject.id}
                label={item.subject.name}
                value={item.score}
                forte={item.score === maiorMateria}
              />
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Aptidão por área</p>
          <ul className="flex flex-col gap-2">
            {areas.map((item) => (
              <Bar
                key={item.area}
                label={areaLabels[item.area]}
                value={item.average}
                forte={item.average === maiorArea}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
