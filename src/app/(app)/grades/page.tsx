"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { GradesTeacher } from "@/widgets/grades-teacher/GradesTeacher";

export default function GradesPage() {
  const permitido = useRequireRole(["teacher"]);
  if (!permitido) return null;
  return <GradesTeacher />;
}
