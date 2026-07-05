"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { SubjectsAdmin } from "@/widgets/subjects-admin/SubjectsAdmin";

export default function SubjectsPage() {
  const permitido = useRequireRole(["admin"]);
  if (!permitido) return null;
  return <SubjectsAdmin />;
}
