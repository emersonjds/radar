"use client";

import dynamic from "next/dynamic";
import { useSession } from "@/features/session/use-session";

// Code-split each persona's home so a professor never ships the admin charts.
const StudentList = dynamic(() =>
  import("@/widgets/student-list/StudentList").then((mod) => mod.StudentList),
);
const AdminPanel = dynamic(() =>
  import("@/widgets/admin-panel/AdminPanel").then((mod) => mod.AdminPanel),
);

export default function HomePage() {
  const { role } = useSession();
  return role === "teacher" ? <StudentList /> : <AdminPanel />;
}
