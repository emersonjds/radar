import { mutateCollection, readCollection } from "@/shared/lib/storage/db";
import { avaliacaoSchema, type Avaliacao } from "./model";

export async function fetchAvaliacoes(): Promise<Avaliacao[]> {
  const rows = await readCollection("avaliacoes");
  return rows.map((row) => avaliacaoSchema.parse(row));
}

export async function fetchAvaliacoesPorTurma(
  turmaId: string,
): Promise<Avaliacao[]> {
  const avaliacoes = await fetchAvaliacoes();
  return avaliacoes
    .filter((avaliacao) => avaliacao.turmaId === turmaId)
    .sort((avaliacaoA, avaliacaoB) => avaliacaoB.data.localeCompare(avaliacaoA.data));
}

function slug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface NovaAvaliacao {
  turmaId: string;
  nome: string;
  data: string;
  peso: number;
  professorId: string;
}

/**
 * Create an assessment. Unique per (turma, nome, data) via the deterministic
 * id — creating an existing one returns it instead of duplicating. The real
 * uniqueness guard will live in Postgres constraints later.
 */
export async function criarAvaliacao(input: NovaAvaliacao): Promise<Avaliacao> {
  const avaliacao = avaliacaoSchema.parse({
    id: `avaliacao-${input.turmaId}-${slug(input.nome)}-${input.data}`,
    ...input,
  });
  await mutateCollection<Avaliacao>("avaliacoes", (rows) => {
    const exists = rows.some((row) => row.id === avaliacao.id);
    return exists ? rows : [...rows, avaliacao];
  });
  return avaliacao;
}
