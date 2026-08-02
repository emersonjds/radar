"use client";

import { useState, type FormEvent } from "react";
import { evaluationTypeLabels, type EvaluationType } from "@/entities/evaluation/model";
import { useCreateEvaluation } from "@/entities/evaluation/queries";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

const controlClasses =
  "h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm text-foreground focus:border-ring focus:outline-hidden focus:ring-3 focus:ring-ring/20";

export interface EvaluationFormModalProps {
  open: boolean;
  groupId: string;
  subjectId: string;
  onClose: () => void;
}

export function EvaluationFormModal({
  open,
  groupId,
  subjectId,
  onClose,
}: EvaluationFormModalProps) {
  const createEvaluation = useCreateEvaluation();
  const [name, setName] = useState("");
  const [type, setType] = useState<EvaluationType>("exam");
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createEvaluation.isPending) return;
    setErro(null);
    try {
      await createEvaluation.mutateAsync({ groupId, subjectId, name, type, date, weight });
      setName("");
      setDate("");
      setWeight(1);
      setType("exam");
      onClose();
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível salvar a avaliação.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <form onSubmit={save}>
          <DialogTitle className="mb-6 text-foreground">Nova avaliação</DialogTitle>

          <div className="mb-5">
            <Label className="mb-1.5" htmlFor="aval-nome">
              Nome
            </Label>
            <input
              id="aval-nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className={controlClasses}
            />
          </div>

          <div className="mb-5">
            <Label className="mb-1.5" htmlFor="aval-tipo">
              Tipo
            </Label>
            <select
              id="aval-tipo"
              value={type}
              onChange={(e) => setType(e.target.value as EvaluationType)}
              className={controlClasses}
            >
              <option value="exam">{evaluationTypeLabels.exam}</option>
              <option value="homework">{evaluationTypeLabels.homework}</option>
            </select>
          </div>

          <div className="mb-5">
            <Label className="mb-1.5" htmlFor="aval-data">
              Data
            </Label>
            <input
              id="aval-data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={controlClasses}
            />
          </div>

          <div className="mb-5">
            <Label className="mb-1.5" htmlFor="aval-peso">
              Peso
            </Label>
            <select
              id="aval-peso"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={controlClasses}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          {erro && (
            <p role="alert" className="mb-5 text-sm text-destructive">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={createEvaluation.isPending}>
              {createEvaluation.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
