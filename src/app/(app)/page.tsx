"use client";

import dynamic from "next/dynamic";
import { useRole } from "@/features/session/session-store";

// Code-split each persona's home so a professor never ships the admin charts.
const TeacherDashboard = dynamic(() =>
  import("@/widgets/teacher-dashboard/TeacherDashboard").then(
    (mod) => mod.TeacherDashboard,
  ),
);
const AdminPanel = dynamic(() =>
  import("@/widgets/admin-panel/AdminPanel").then((mod) => mod.AdminPanel),
);

export default function HomePage() {
  const papel = useRole();
  return papel === "admin" ? <AdminPanel /> : <TeacherDashboard />;
}
