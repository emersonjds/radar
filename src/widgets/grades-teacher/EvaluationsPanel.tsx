"use client";

import { useState } from "react";
import { evaluationTypeLabels, type Evaluation } from "@/entities/evaluation/model";
import { useEvaluationsByAssignment, useDeleteEvaluation } from "@/entities/evaluation/queries";
import { Button } from "@/shared/ui/button";
import { EvaluationFormModal } from "./EvaluationFormModal";
import { GradeEntryPanel } from "./GradeEntryPanel";

export function EvaluationsPanel({ groupId, subjectId }: { groupId: string; subjectId: string }) {
  const { data: evaluations, isLoading } = useEvaluationsByAssignment(groupId, subjectId);
  const deleteEvaluation = useDeleteEvaluation();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-gray-800">Avaliações</h4>
        <Button size="sm" onClick={() => setCreating(true)}>
          Nova avaliação
        </Button>
      </div>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <ul className="flex flex-col gap-2">
          {(evaluations ?? []).map((evaluation: Evaluation) => (
            <li
              key={evaluation.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{evaluation.name}</p>
                  <p className="text-xs text-gray-500">
                    {evaluationTypeLabels[evaluation.type]} · peso {evaluation.weight} ·{" "}
                    {evaluation.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenId(openId === evaluation.id ? null : evaluation.id)}
                  >
                    {openId === evaluation.id ? "Fechar notas" : "Lançar notas"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteEvaluation.mutate(evaluation.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
              {openId === evaluation.id && <GradeEntryPanel evaluation={evaluation} />}
            </li>
          ))}
          {(evaluations ?? []).length === 0 && (
            <li className="text-sm text-gray-500">Nenhuma avaliação ainda.</li>
          )}
        </ul>
      )}

      <EvaluationFormModal
        open={creating}
        groupId={groupId}
        subjectId={subjectId}
        onClose={() => setCreating(false)}
      />
    </div>
  );
}
