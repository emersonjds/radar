import { Suspense } from "react";
import { StudentList } from "@/widgets/student-list/StudentList";

// StudentList lê useSearchParams (?q= / ?filtro=); o Suspense permite o
// prerender estático da casca enquanto os params resolvem no cliente.
export default function AlunosPage() {
  return (
    <Suspense>
      <StudentList />
    </Suspense>
  );
}
