"use client";

import type { StatusPresenca } from "@/shared/lib/store/db";
import { useChamada } from "./use-chamada";

interface ChamadaFormProps {
  turmaId: string;
  professorId: string;
}

const OPCOES: { status: StatusPresenca; rotulo: string; ativoClasses: string }[] = [
  { status: "presente", rotulo: "Presente", ativoClasses: "bg-green-600 text-white" },
  { status: "atrasado", rotulo: "Atrasado", ativoClasses: "bg-accent text-white" },
  { status: "ausente", rotulo: "Ausente", ativoClasses: "bg-red-600 text-white" },
  { status: "justificado", rotulo: "Justificado", ativoClasses: "bg-gray-500 text-white" },
];

export function ChamadaForm({ turmaId, professorId }: ChamadaFormProps) {
  const { alunos, registros, carregando, setStatus, salvar, salvando } = useChamada(turmaId, professorId);

  if (carregando) {
    return <p className="p-4 text-sm text-gray-500">Carregando chamada...</p>;
  }

  if (alunos.length === 0) {
    return <p className="p-4 text-sm text-gray-500">Esta turma ainda não tem alunos cadastrados.</p>;
  }

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <ul className="flex-1 divide-y divide-gray-200">
        {alunos.map((aluno) => {
          const statusAtual = registros.find((registro) => registro.alunoId === aluno.id)?.status ?? "presente";
          return (
            <li key={aluno.id} className="flex flex-col gap-2 px-4 py-3">
              <span className="font-medium text-gray-900">{aluno.nome}</span>
              <div className="grid grid-cols-4 gap-2">
                {OPCOES.map((opcao) => (
                  <button
                    key={opcao.status}
                    type="button"
                    onClick={() => setStatus(aluno.id, opcao.status)}
                    className={`rounded-md px-1 py-2 text-xs font-medium ${
                      statusAtual === opcao.status ? opcao.ativoClasses : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="w-full rounded-md bg-brand-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar chamada"}
        </button>
      </div>
    </div>
  );
}
