import { Suspense } from "react";
import { ListaAlunos } from "@/widgets/lista-alunos/ListaAlunos";

// ListaAlunos lê useSearchParams (?q= / ?filtro=); o Suspense permite o
// prerender estático da casca enquanto os params resolvem no cliente.
export default function AlunosPage() {
  return (
    <Suspense>
      <ListaAlunos />
    </Suspense>
  );
}
