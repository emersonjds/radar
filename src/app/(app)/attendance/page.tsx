"use client";

import { AttendanceForm } from "@/features/take-attendance/AttendanceForm";
import { useRequireRole } from "@/features/session/use-require-role";

export default function ChamadaPage() {
  const permitido = useRequireRole(["teacher"]);
  if (!permitido) return null;
  return <AttendanceForm />;
}
