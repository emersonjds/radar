import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listarAlunosDaTurma } from "@/entities/aluno/api";
import { abrirOuObterChamada } from "@/entities/chamada/api";
import { listarPresencasDaChamada, salvarPresencas } from "@/entities/presenca/api";
import type { Aluno, StatusPresenca } from "@/shared/lib/store/db";
import { montarRegistrosIniciais, toggleStatus, type Registro } from "./model";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

interface UseChamadaResult {
  alunos: Aluno[];
  registros: Registro[];
  carregando: boolean;
  setStatus: (alunoId: string, status: StatusPresenca) => void;
  salvar: () => void;
  salvando: boolean;
}

export function useChamada(turmaId: string, professorId: string): UseChamadaResult {
  const queryClient = useQueryClient();
  const chamadaQueryKey = ["chamada", turmaId, hoje()];

  const { data, isLoading } = useQuery({
    queryKey: chamadaQueryKey,
    queryFn: async () => {
      const [alunos, chamada] = await Promise.all([
        listarAlunosDaTurma(turmaId),
        abrirOuObterChamada(turmaId, hoje(), professorId),
      ]);
      const presencas = await listarPresencasDaChamada(chamada.id);
      const registros = montarRegistrosIniciais(alunos).map((registro) => {
        const existente = presencas.find((presenca) => presenca.alunoId === registro.alunoId);
        return existente ? { ...registro, status: existente.status } : registro;
      });
      return { chamadaId: chamada.id, alunos, registros };
    },
    enabled: Boolean(turmaId && professorId),
  });

  const alunos = useMemo(() => data?.alunos ?? [], [data]);
  const registros = useMemo(() => data?.registros ?? [], [data]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!data) return;
      await salvarPresencas(data.chamadaId, registros);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chamadaQueryKey });
      toast.success("Chamada salva");
    },
  });

  function setStatus(alunoId: string, status: StatusPresenca) {
    if (!data) return;
    queryClient.setQueryData(chamadaQueryKey, { ...data, registros: toggleStatus(data.registros, alunoId, status) });
  }

  return {
    alunos,
    registros,
    carregando: isLoading,
    setStatus,
    salvar: () => salvarMutation.mutate(),
    salvando: salvarMutation.isPending,
  };
}
